import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';

// Debug: Log API key status
console.log('Gemini API Key exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
console.log('Gemini API Key length:', import.meta.env.VITE_GEMINI_API_KEY?.length);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Identifies the best matching category for a job brief
 * @param {string} jobBrief - The job description
 * @param {Array} categories - Array of category objects with id, name, description
 * @returns {Promise<string|null>} - The category ID or null
 */
export async function identifyCategory(jobBrief, categories) {
    if (!categories || categories.length === 0) {
        console.warn('No categories available for classification');
        return null;
    }

    const categoryList = categories
        .map(cat => `- ID: ${cat.id}, Name: ${cat.name}, Description: ${cat.description || 'N/A'}`)
        .join('\n');

    const prompt = `You are an expert job classifier for Upwork freelance projects.

Given the following job brief:
"""
${jobBrief}
"""

And these available categories:
${categoryList}

Analyze the job brief and return ONLY the ID of the most relevant category. Return just the ID number, nothing else.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const categoryId = response.text().trim();

        console.log('Identified category ID:', categoryId);
        return categoryId;
    } catch (error) {
        console.error('Error identifying category:', error);
        throw new Error('Failed to identify job category');
    }
}

/**
 * Generates a cover letter using the job brief and selected assets
 * @param {string} jobBrief - The job description
 * @param {Array} winningProposals - Array of winning proposal objects
 * @param {Array} portfolioItems - Array of portfolio item objects
 * @returns {Promise<string>} - The generated cover letter
 */
export async function generateCoverLetter(jobBrief, winningProposals, portfolioItems) {
    const hasProposals = winningProposals && winningProposals.length > 0;
    const hasPortfolio = portfolioItems && portfolioItems.length > 0;

    const proposalExamples = hasProposals
        ? winningProposals.map(p => `Title: ${p.title}\nContent: ${p.content}`).join('\n\n')
        : 'No winning proposals available.';

    const portfolioLinks = hasPortfolio
        ? portfolioItems.map(p => `- ${p.title}: ${p.link}${p.description ? ` (${p.description})` : ''}`).join('\n')
        : 'No portfolio items available.';

    let prompt;

    if (!hasProposals && !hasPortfolio) {
        // Simplified prompt when no data is available
        prompt = `You are an expert Upwork proposal writer. Your task is to create a compelling, personalized cover letter for the following job.

JOB BRIEF:
"""
${jobBrief}
"""

INSTRUCTIONS:
1. Write a professional, engaging cover letter that directly addresses the job requirements
2. Keep it concise (150-250 words)
3. Focus on value proposition and relevant experience
4. Do NOT use placeholder text or generic statements
5. Make it feel personal and tailored to this specific job
6. Highlight relevant skills and expertise based on the job description

Generate the cover letter now:`;
    } else {
        // Full prompt with examples
        prompt = `You are an expert Upwork proposal writer. Your task is to create a compelling, personalized cover letter for the following job.

JOB BRIEF:
"""
${jobBrief}
"""

WINNING PROPOSAL EXAMPLES (use these as style/tone reference):
${proposalExamples}

PORTFOLIO ITEMS TO REFERENCE:
${portfolioLinks}

INSTRUCTIONS:
1. Write a professional, engaging cover letter that directly addresses the job requirements
2. ${hasProposals ? 'Match the tone and style of the winning proposal examples' : 'Use a professional and engaging tone'}
3. ${hasPortfolio ? 'Naturally incorporate 1-2 relevant portfolio links where appropriate' : 'Focus on relevant skills and experience'}
4. Keep it concise (150-250 words)
5. Focus on value proposition and relevant experience
6. Do NOT use placeholder text or generic statements
7. Make it feel personal and tailored to this specific job

Generate the cover letter now:`;
    }

    try {
        console.log('Calling Gemini API to generate cover letter...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const coverLetter = response.text().trim();

        console.log('Generated cover letter successfully, length:', coverLetter.length);
        return coverLetter;
    } catch (error) {
        console.error('Error generating cover letter:', error);
        console.error('Error details:', error.message, error.stack);
        throw new Error('Failed to generate cover letter: ' + error.message);
    }
}

/**
 * Main orchestration function that handles the entire proposal generation flow
 * @param {string} jobBrief - The job description
 * @param {Function} onStatusUpdate - Callback for status updates
 * @returns {Promise<Object>} - Object containing the generated proposal and metadata
 */
export async function generateProposal(jobBrief, onStatusUpdate) {
    try {
        console.log('=== Starting proposal generation ===');
        console.log('Job brief length:', jobBrief?.length);

        // Step 1: Fetch categories
        onStatusUpdate?.('Analyzing job brief...');
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (catError) {
            console.error('Error fetching categories:', catError);
        }

        // If no categories exist, generate a basic proposal without categorization
        if (!categories || categories.length === 0) {
            console.warn('No categories found. Generating proposal without categorization.');
            onStatusUpdate?.('Generating your cover letter...');

            const coverLetter = await generateCoverLetter(jobBrief, [], []);

            return {
                coverLetter,
                category: 'General',
                proposalsUsed: 0,
                portfolioUsed: 0
            };
        }

        // Step 2: Identify category
        onStatusUpdate?.('Identifying job category...');
        let categoryId;
        try {
            categoryId = await identifyCategory(jobBrief, categories);
        } catch (error) {
            console.error('Error identifying category:', error);
            // Fallback to first category if identification fails
            categoryId = categories[0].id.toString();
        }

        if (!categoryId) {
            // Use first category as fallback
            categoryId = categories[0].id.toString();
        }

        const matchedCategory = categories.find(c => c.id.toString() === categoryId.toString());

        if (!matchedCategory) {
            console.warn('Category ID not found in list, using first category as fallback');
            const fallbackCategory = categories[0];
            onStatusUpdate?.(`Using category: ${fallbackCategory.name}`);

            // Fetch proposals and portfolio for fallback category
            const { data: proposals } = await supabase
                .from('proposals')
                .select('*')
                .eq('category_id', fallbackCategory.id);

            const { data: portfolio } = await supabase
                .from('portfolio_items')
                .select('*')
                .eq('category_id', fallbackCategory.id);

            onStatusUpdate?.('Generating your cover letter...');
            const coverLetter = await generateCoverLetter(jobBrief, proposals || [], portfolio || []);

            return {
                coverLetter,
                category: fallbackCategory.name,
                proposalsUsed: proposals?.length || 0,
                portfolioUsed: portfolio?.length || 0
            };
        }

        onStatusUpdate?.(`Matched category: ${matchedCategory.name}`);

        // Step 3: Fetch proposals and portfolio for the identified category
        onStatusUpdate?.('Selecting relevant proposals and portfolio...');
        const { data: proposals, error: propError } = await supabase
            .from('proposals')
            .select('*')
            .eq('category_id', categoryId);

        if (propError) {
            console.error('Error fetching proposals:', propError);
        }

        const { data: portfolio, error: portError } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('category_id', categoryId);

        if (portError) {
            console.error('Error fetching portfolio:', portError);
        }

        // Step 4: Generate cover letter (even if proposals/portfolio are empty)
        onStatusUpdate?.('Generating your cover letter...');
        const coverLetter = await generateCoverLetter(jobBrief, proposals || [], portfolio || []);

        console.log('=== Proposal generation complete ===');
        return {
            coverLetter,
            category: matchedCategory.name,
            proposalsUsed: proposals?.length || 0,
            portfolioUsed: portfolio?.length || 0
        };

    } catch (error) {
        console.error('Error in generateProposal:', error);
        console.error('Error stack:', error.stack);

        // Last resort: generate a basic proposal without any data
        try {
            onStatusUpdate?.('Generating basic cover letter...');
            const coverLetter = await generateCoverLetter(jobBrief, [], []);
            return {
                coverLetter,
                category: 'General',
                proposalsUsed: 0,
                portfolioUsed: 0
            };
        } catch (fallbackError) {
            console.error('Fallback generation also failed:', fallbackError);
            throw new Error('Failed to generate proposal. Please check your API key and try again.');
        }
    }
}
