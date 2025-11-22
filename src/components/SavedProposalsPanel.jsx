import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useTelegram from '../hooks/useTelegram';
import './SettingsPanel.css'; // Reusing panel styles

const SavedProposalsPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [savedProposals, setSavedProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isTelegram, hapticFeedback } = useTelegram();

    useEffect(() => {
        if (isOpen) {
            fetchSavedProposals();
        }
    }, [isOpen]);

    const fetchSavedProposals = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('saved_proposals')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedProposals(data || []);
        } catch (err) {
            console.error('Error fetching saved proposals:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeSavedProposal = async (id) => {
        if (!window.confirm("Delete this saved proposal?")) return;
        try {
            const { error } = await supabase.from('saved_proposals').delete().eq('id', id);
            if (error) throw error;
            setSavedProposals(savedProposals.filter(p => p.id !== id));
            if (isTelegram) hapticFeedback('light');
        } catch (err) {
            console.error('Error deleting saved proposal:', err);
            alert('Failed to delete proposal');
        }
    };

    const copySavedProposal = (content) => {
        navigator.clipboard.writeText(content);
        if (isTelegram) hapticFeedback('light');
        alert('Copied to clipboard!');
    };

    return (
        <>
            <button
                className={`settings-toggle saved-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Saved Proposals"
                style={{ right: '5rem' }} // Positioned to the left of settings gear
            >
                ★
            </button>

            <div className={`settings-panel glass-panel ${isOpen ? 'open' : ''}`}>
                <div className="settings-header">
                    <h2 className="section-title">Saved Proposals ⭐</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-small" onClick={fetchSavedProposals} disabled={loading}>↻</button>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                </div>

                <div className="settings-content">
                    {loading && <p className="loading-text">Loading saved proposals...</p>}
                    {error && <p className="error-text" style={{ color: '#ef4444' }}>Error: {error}</p>}

                    <div className="settings-section">
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Your collection of favorite generated proposals.
                        </p>
                        <ul className="items-list">
                            {savedProposals.map((prop) => (
                                <li key={prop.id} className="list-item column">
                                    <div className="item-header">
                                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {new Date(prop.created_at).toLocaleDateString()}
                                        </strong>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-small"
                                                onClick={() => copySavedProposal(prop.content)}
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                            >
                                                Copy
                                            </button>
                                            <button className="delete-btn" onClick={() => removeSavedProposal(prop.id)}>×</button>
                                        </div>
                                    </div>
                                    <p className="item-preview" style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
                                        {prop.content}
                                    </p>
                                </li>
                            ))}
                            {!loading && savedProposals.length === 0 && <p className="empty-text">No saved proposals yet.</p>}
                        </ul>
                    </div>
                </div>
            </div>

            {isOpen && <div className="settings-overlay" onClick={() => setIsOpen(false)}></div>}
        </>
    );
};

export default SavedProposalsPanel;
