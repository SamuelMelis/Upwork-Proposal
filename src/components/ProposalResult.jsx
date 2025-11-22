import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ChatInterface from './ChatInterface';
import './ProposalResult.css';

const ProposalResult = ({ proposal }) => {
    const [currentProposal, setCurrentProposal] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    // Update local state when proposal prop changes
    useEffect(() => {
        if (proposal) {
            setCurrentProposal(proposal);
            setIsSaved(false); // Reset save state for new proposal
        }
    }, [proposal]);

    const handleCopy = () => {
        const textToCopy = typeof currentProposal === 'string' ? currentProposal : currentProposal.text;
        navigator.clipboard.writeText(textToCopy);
    };

    const handleSave = async () => {
        if (isSaved) return;

        const proposalText = typeof currentProposal === 'string' ? currentProposal : currentProposal.text;

        try {
            const { error } = await supabase
                .from('saved_proposals')
                .insert([{ content: proposalText }]);

            if (error) throw error;
            setIsSaved(true);
        } catch (err) {
            console.error('Error saving proposal:', err);
            alert('Failed to save proposal');
        }
    };

    const handleProposalUpdate = (updatedText) => {
        // Update the proposal text while keeping metadata
        if (typeof currentProposal === 'object' && currentProposal.metadata) {
            setCurrentProposal({
                ...currentProposal,
                text: updatedText
            });
        } else {
            setCurrentProposal(updatedText);
        }
        setIsSaved(false); // Reset save state if edited
    };

    if (!currentProposal) return null;

    // Handle both old format (string) and new format (object with text + metadata)
    const proposalText = typeof currentProposal === 'string' ? currentProposal : currentProposal.text;
    const portfolioUsed = currentProposal?.portfolioUsed || 0;

    return (
        <div className="proposal-result-container glass-panel fade-in">
            <div className="result-header">
                <h2 className="section-title">Generated Proposal</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`icon-btn ${isSaved ? 'saved' : ''}`}
                        onClick={handleSave}
                        title={isSaved ? "Saved!" : "Save Proposal"}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: isSaved ? '#fbbf24' : 'var(--text-secondary)',
                            transition: 'transform 0.2s ease, color 0.2s ease'
                        }}
                    >
                        {isSaved ? '★' : '☆'}
                    </button>
                    <button className="copy-btn" onClick={handleCopy}>
                        Copy to Clipboard
                    </button>
                </div>
            </div>

            {portfolioUsed > 0 && (
                <div className="proposal-metadata" style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                }}>
                    <strong style={{ color: 'var(--accent-color)' }}>Portfolio Items Selected:</strong> {portfolioUsed}
                </div>
            )}

            <div className="proposal-content">
                <pre>{proposalText}</pre>
            </div>

            <ChatInterface
                currentProposal={proposalText}
                onProposalUpdate={handleProposalUpdate}
            />
        </div>
    );
};

export default ProposalResult;
