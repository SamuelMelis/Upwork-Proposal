import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import JobInput from '../components/JobInput';
import ProposalResult from '../components/ProposalResult';
import { generateProposal } from '../utils/gemini';

const Home = () => {
    const [jobBrief, setJobBrief] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedProposal, setGeneratedProposal] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedProposal(null);
        setStatusMessage('Starting AI analysis...');

        try {
            const result = await generateProposal(jobBrief, (status) => {
                setStatusMessage(status);
            });

            // Format the result for display
            const formattedProposal = {
                text: result.coverLetter,
                metadata: {
                    category: result.category,
                    proposalsUsed: result.proposalsUsed,
                    portfolioUsed: result.portfolioUsed
                }
            };

            setGeneratedProposal(formattedProposal);
        } catch (error) {
            console.error("Generation failed", error);
            setStatusMessage(error.message || "Error generating proposal. Please try again.");
            setTimeout(() => setStatusMessage(''), 5000);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }}>
                    Upwork AI Proposal Generator
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Craft winning cover letters in seconds with AI.
                </p>

                {/* Settings Link */}
                <Link to="/settings" className="settings-link" style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    textDecoration: 'none',
                    fontSize: '1.5rem',
                    color: 'var(--text-secondary)',
                    transition: 'color 0.3s ease'
                }} aria-label="Settings">
                    ⚙️
                </Link>
            </header>

            <main>
                <JobInput
                    value={jobBrief}
                    onChange={setJobBrief}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                />

                {isGenerating && (
                    <div className="status-indicator fade-in" style={{
                        textAlign: 'center',
                        margin: '2rem 0',
                        color: 'var(--accent-color)'
                    }}>
                        <p>{statusMessage}</p>
                    </div>
                )}

                <ProposalResult proposal={generatedProposal} />
            </main>
        </div>
    );
};

export default Home;
