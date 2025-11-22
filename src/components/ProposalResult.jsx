import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import './ProposalResult.css';

const ProposalResult = ({ proposal }) => {
    const [currentProposal, setCurrentProposal] = useState(null);

    // Update local state when proposal prop changes
    useEffect(() => {
        if (proposal) {
            setCurrentProposal(proposal);
        }
    }, [proposal]);

    const handleCopy = () => {
        const textToCopy = currentProposal?.text || currentProposal;
        navigator.clipboard.writeText(textToCopy);
        // Could add a toast notification here
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
    };

    if (!currentProposal) return null;

    // Handle both old format (string) and new format (object with text + metadata)
    const proposalText = typeof currentProposal === 'string' ? currentProposal : currentProposal.text;
    const metadata = currentProposal.metadata;

    return (
        <div className="proposal-result-container glass-panel fade-in">
            <div className="result-header">
                <h2 className="section-title">Generated Proposal</h2>
                <button className="copy-btn" onClick={handleCopy}>
                    Copy to Clipboard
                </button>
            </div>

            {metadata && (
                <div className="proposal-metadata" style={{
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                }}>
                    <strong style={{ color: 'var(--accent-color)' }}>Category:</strong> {metadata.category} |
                    <strong style={{ color: 'var(--accent-color)', marginLeft: '1rem' }}>Proposals Used:</strong> {metadata.proposalsUsed} |
                    <strong style={{ color: 'var(--accent-color)', marginLeft: '1rem' }}>Portfolio Items:</strong> {metadata.portfolioUsed}
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
