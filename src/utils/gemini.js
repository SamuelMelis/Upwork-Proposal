import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';
import { apiKeyManager } from './apiKeyManager';

/**
 * Get a fresh model instance with the current API key
 */
function getModel() {
    const currentKey = apiKeyManager.getCurrentKey();
    const genAI = new GoogleGenerativeAI(currentKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

/**
 * Call Gemini API with automatic retry and key rotation on quota errors
 * @param {Function} apiCall - The API call function to execute
 * @param {number} maxRetries - Maximum number of retries (defaults to total keys available)
 */
async function callWithRetry(apiCall, maxRetries = null) {
    const totalKeys = apiKeyManager.getTotalKeys();
    const attempts = maxRetries || totalKeys;

    for (let attempt = 0; attempt < attempts; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            const isLastAttempt = attempt === attempts - 1;
            const isQuotaError = apiKeyManager.isQuotaError(error);

            if (isQuotaError && !isLastAttempt) {
                console.warn(`⚠️ Quota error detected on attempt ${attempt + 1}:`, error.message);
                const rotated = apiKeyManager.rotateToNextKey();

                if (rotated) {
                    console.log(`🔄 Retrying with next API key (attempt ${attempt + 2}/${attempts})...`);
                    continue; // Try again with new key
                } else {
                    console.error('❌ No more API keys available for rotation');
                    throw error;
                }
            } else {
                // Non-quota error or last attempt - throw immediately
                throw error;
            }
        }
    }
}

/**
 * Selects the most relevant portfolio items based on job description
 * @param {string} jobBrief - The job description
 * @param {Array} allPortfolio - All available portfolio items
 * @returns {Promise<Array>} - Array of 2-3 most relevant portfolio items
 */
export async function selectRelevantPortfolio(jobBrief, allPortfolio) {
    if (!allPortfolio || allPortfolio.length === 0) {
        console.warn('No portfolio items available');
        return [];
    }

    const portfolioList = allPortfolio
        .map((item, index) => `${index + 1}. ${item.title}\n   Description: ${item.description}\n   Link: ${item.link}`)
        .join('\n\n');

    const prompt = `You are an expert at matching portfolio work to job requirements.

JOB DESCRIPTION:
"""
${jobBrief}
"""

AVAILABLE PORTFOLIO ITEMS:
${portfolioList}

TASK:
Analyze the job description and select the 2-3 most relevant portfolio items that best demonstrate the skills needed for this job.

Return ONLY the numbers of the selected items (e.g., "1, 3, 5"), nothing else.`;

    try {
        const selectedIndices = await callWithRetry(async () => {
            const model = getModel();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();

            // Parse the response to get indices
            const indices = text.match(/\d+/g)?.map(n => parseInt(n) - 1) || [];
            console.log('Selected portfolio indices:', indices);
            return indices;
        });

        // Return the selected portfolio items
        const selected = selectedIndices
            .filter(i => i >= 0 && i < allPortfolio.length)
            .map(i => allPortfolio[i])
            .slice(0, 3); // Max 3 items

        console.log(`Selected ${selected.length} portfolio items`);
        return selected;
    } catch (error) {
        console.error('Error selecting portfolio:', error);
        // Fallback: return first 2 items
        return allPortfolio.slice(0, 2);
    }
}

/**
 * Generates a cover letter using job brief, context, rules, and selected portfolio
 * @param {string} jobBrief - The job description
 * @param {Array} portfolioItems - Selected portfolio items
 * @param {string} personalContext - Personal/professional context
 * @param {string} proposalRules - Proposal formatting rules
 * @returns {Promise<string>} - The generated cover letter
 */
export async function generateCoverLetter(jobBrief, portfolioItems, personalContext, proposalRules) {
    const hasPortfolio = portfolioItems && portfolioItems.length > 0;
    const hasContext = personalContext && personalContext.trim() !== '';
    const hasRules = proposalRules && proposalRules.trim() !== '';

    const portfolioLinks = hasPortfolio
        ? portfolioItems.map(p => `- ${p.title}: ${p.link}`).join('\n')
        : '';

    const prompt = `You are an expert Upwork proposal writer. Create a compelling cover letter for this job.

JOB DESCRIPTION:
"""
${jobBrief}
"""
${hasContext ? `
ABOUT THE FREELANCER:
"""
${personalContext}
"""
` : ''}
${hasPortfolio ? `
RELEVANT PORTFOLIO ITEMS TO MENTION:
${portfolioLinks}
` : ''}
${hasRules ? `
PROPOSAL WRITING GUIDELINES (FOLLOW THESE STRICTLY):
"""
${proposalRules}
"""
` : ''}

INSTRUCTIONS:
1. Write a natural, human-sounding proposal (not AI-like or overly formal)
2. Tailor it specifically to this job description
3. ${hasPortfolio ? 'Include the portfolio links naturally' : 'Focus on relevant skills'}
4. ${hasRules ? 'Follow ALL the proposal writing guidelines provided above' : 'Keep it professional and concise'}
5. Keep it 3-5 paragraphs maximum
6. Write in first person as the freelancer
7. End with a friendly call to action

Generate the proposal now:`;

    try {
        return await callWithRetry(async () => {
            const model = getModel();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const coverLetter = response.text().trim();

            console.log('Generated cover letter successfully, length:', coverLetter.length);
            return coverLetter;
        });
    } catch (error) {
        console.error('Error generating cover letter:', error);
        throw new Error('Failed to generate cover letter: ' + error.message);
    }
}

/**
 * Edits an existing proposal based on user's request
 * @param {string} currentProposal - The current proposal text
 * @param {string} userRequest - User's edit request
 * @param {Array} chatHistory - Previous chat messages for context
 * @returns {Promise<string>} - The updated proposal text
 */
export async function editProposal(currentProposal, userRequest, chatHistory = []) {
    const prompt = `You are an expert proposal editor. Modify the proposal based on the user's request.

CURRENT PROPOSAL:
"""
${currentProposal}
"""

USER'S REQUEST:
"""
${userRequest}
"""

INSTRUCTIONS:
1. Carefully read the user's request
2. Modify the proposal accordingly while maintaining professional quality
3. Keep the same structure unless asked to change it
4. Return ONLY the updated proposal text, nothing else
5. Do NOT add explanations or meta-text
6. Maintain the tone unless specifically asked to change it

Generate the updated proposal now:`;

    try {
        return await callWithRetry(async () => {
            const model = getModel();
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const updatedProposal = response.text().trim();

            console.log('Proposal edited successfully, new length:', updatedProposal.length);
            return updatedProposal;
        });
    } catch (error) {
        console.error('Error editing proposal:', error);
        throw new Error('Failed to edit proposal: ' + error.message);
    }
}

/**
 * Main function that generates a complete proposal
 * @param {string} jobBrief - The job description
 * @param {Function} onStatusUpdate - Callback for status updates
 * @returns {Promise<Object>} - Object containing the generated proposal
 */
export async function generateProposal(jobBrief, onStatusUpdate) {
    try {
        console.log('=== Starting proposal generation ===');
        console.log('Job brief length:', jobBrief?.length);

        // Step 1: Fetch personal context
        onStatusUpdate?.('Loading your profile...');
        const { data: contextData } = await supabase
            .from('personal_context')
            .select('*')
            .limit(1)
            .single();

        const personalContext = contextData?.content || null;

        // Step 2: Fetch proposal rules
        onStatusUpdate?.('Loading proposal guidelines...');
        const { data: rulesData } = await supabase
            .from('proposal_rules')
            .select('*')
            .limit(1)
            .single();

        const proposalRules = rulesData?.content || null;

        // Step 3: Fetch all portfolio items
        onStatusUpdate?.('Analyzing your portfolio...');
        const { data: allPortfolio } = await supabase
            .from('portfolio_items')
            .select('*')
            .order('created_at', { ascending: false });

        // Step 4: AI selects relevant portfolio items
        onStatusUpdate?.('Selecting relevant portfolio items...');
        const selectedPortfolio = await selectRelevantPortfolio(jobBrief, allPortfolio || []);

        // Step 5: Generate cover letter
        onStatusUpdate?.('Generating your personalized proposal...');
        const coverLetter = await generateCoverLetter(
            jobBrief,
            selectedPortfolio,
            personalContext,
            proposalRules
        );

        console.log('=== Proposal generation complete ===');
        return {
            coverLetter,
            portfolioUsed: selectedPortfolio.length
        };

    } catch (error) {
        console.error('Error in generateProposal:', error);
        throw new Error('Failed to generate proposal: ' + error.message);
    }
}
