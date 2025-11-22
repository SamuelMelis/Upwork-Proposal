import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useTelegram from '../hooks/useTelegram';
import '../components/SettingsPanel.css'; // Reusing styles

const SettingsPage = () => {
    const navigate = useNavigate();
    const { isTelegram, showBackButton, hideBackButton, hapticFeedback } = useTelegram();

    // Supabase State
    const [portfolio, setPortfolio] = useState([]);
    const [personalContext, setPersonalContext] = useState(null);
    const [proposalRules, setProposalRules] = useState(null);
    const [savedProposals, setSavedProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Local Form State
    const [newPortfolio, setNewPortfolio] = useState({ title: '', link: '', description: '' });
    const [contextContent, setContextContent] = useState('');
    const [rulesContent, setRulesContent] = useState('');

    // Show Telegram back button when on settings page
    useEffect(() => {
        if (isTelegram) {
            showBackButton(() => {
                hapticFeedback('light');
                navigate('/');
            });
        }

        return () => {
            if (isTelegram) {
                hideBackButton();
            }
        };
    }, [isTelegram, showBackButton, hideBackButton, navigate, hapticFeedback]);

    // Fetch Data on Mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching data from Supabase...");

            const { data: ports, error: portError } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: true });
            if (portError) throw portError;

            const { data: context, error: contextError } = await supabase.from('personal_context').select('*').limit(1).single();
            if (contextError && contextError.code !== 'PGRST116') {
                console.warn('Error fetching context:', contextError);
            }

            const { data: rules, error: rulesError } = await supabase.from('proposal_rules').select('*').limit(1).single();
            if (rulesError && rulesError.code !== 'PGRST116') {
                console.warn('Error fetching rules:', rulesError);
            }

            const { data: saved, error: savedError } = await supabase.from('saved_proposals').select('*').order('created_at', { ascending: false });
            if (savedError) throw savedError;

            setPortfolio(ports || []);
            setPersonalContext(context || null);
            setContextContent(context?.content || '');
            setProposalRules(rules || null);
            setRulesContent(rules?.content || '');
            setSavedProposals(saved || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const saveContext = async () => {
        if (!contextContent.trim()) {
            alert('Please enter some context about yourself.');
            return;
        }

        try {
            if (personalContext) {
                const { data, error } = await supabase
                    .from('personal_context')
                    .update({ content: contextContent, updated_at: new Date().toISOString() })
                    .eq('id', personalContext.id)
                    .select();

                if (error) throw error;
                if (data) {
                    setPersonalContext(data[0]);
                    alert('Context updated successfully!');
                }
            } else {
                const { data, error } = await supabase
                    .from('personal_context')
                    .insert([{ content: contextContent }])
                    .select();

                if (error) throw error;
                if (data) {
                    setPersonalContext(data[0]);
                    alert('Context saved successfully!');
                }
            }
        } catch (err) {
            console.error('Error saving context:', err);
            alert('Error saving context: ' + err.message);
        }
    };

    const saveRules = async () => {
        if (!rulesContent.trim()) {
            alert('Please enter proposal rules.');
            return;
        }

        try {
            if (proposalRules) {
                const { data, error } = await supabase
                    .from('proposal_rules')
                    .update({ content: rulesContent, updated_at: new Date().toISOString() })
                    .eq('id', proposalRules.id)
                    .select();

                if (error) throw error;
                if (data) {
                    setProposalRules(data[0]);
                    alert('Proposal rules updated successfully!');
                }
            } else {
                const { data, error } = await supabase
                    .from('proposal_rules')
                    .insert([{ content: rulesContent }])
                    .select();

                if (error) throw error;
                if (data) {
                    setProposalRules(data[0]);
                    alert('Proposal rules saved successfully!');
                }
            }
        } catch (err) {
            console.error('Error saving rules:', err);
            alert('Error saving rules: ' + err.message);
        }
    };

    const addPortfolio = async () => {
        if (!newPortfolio.title.trim() || !newPortfolio.link.trim() || !newPortfolio.description.trim()) {
            alert("Please fill in all portfolio fields.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('portfolio_items')
                .insert([{
                    title: newPortfolio.title,
                    link: newPortfolio.link,
                    description: newPortfolio.description
                }])
                .select();

            if (error) throw error;
            if (data) {
                setPortfolio([...portfolio, data[0]]);
                setNewPortfolio({ title: '', link: '', description: '' });
            }
        } catch (err) {
            console.error('Error adding portfolio:', err);
            alert('Error adding portfolio: ' + err.message);
        }
    };

    const removePortfolio = async (id) => {
        if (!window.confirm("Delete this portfolio item?")) return;
        try {
            const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
            if (error) throw error;
            setPortfolio(portfolio.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting portfolio:', err);
        }
    };

    const removeSavedProposal = async (id) => {
        if (!window.confirm("Delete this saved proposal?")) return;
        try {
            const { error } = await supabase.from('saved_proposals').delete().eq('id', id);
            if (error) throw error;
            setSavedProposals(savedProposals.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting saved proposal:', err);
        }
    };

    const copySavedProposal = (content) => {
        navigator.clipboard.writeText(content);
        if (isTelegram) hapticFeedback('light');
        alert('Copied to clipboard!');
    };

    return (
        <div className="container" style={{ maxWidth: '900px', paddingTop: '2rem' }}>
            <div className="settings-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/" className="btn-small" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        ← Back
                    </Link>
                    <h2 className="section-title" style={{ margin: 0, fontSize: '2rem' }}>Settings & Data</h2>
                </div>
                <button className="btn-small" onClick={fetchData} disabled={loading}>Refresh Data ↻</button>
            </div>

            <div className="glass-panel">
                {loading && <p className="loading-text">Loading data from Supabase...</p>}
                {error && <p className="error-text" style={{ color: '#ef4444' }}>Error: {error}</p>}

                {/* Saved Proposals Section */}
                <div className="settings-section">
                    <h3>Saved Proposals ⭐</h3>
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
                                <p className="item-preview" style={{ whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto' }}>
                                    {prop.content}
                                </p>
                            </li>
                        ))}
                        {!loading && savedProposals.length === 0 && <p className="empty-text">No saved proposals yet.</p>}
                    </ul>
                </div>

                {/* Personal Context Section */}
                <div className="settings-section">
                    <h3>Personal Context</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Your professional background, skills, and experience. The AI uses this to personalize proposals.
                    </p>
                    <div className="add-form column">
                        <textarea
                            placeholder="Example: I'm a professional video editor with 5+ years of experience..."
                            value={contextContent}
                            onChange={(e) => setContextContent(e.target.value)}
                            className="settings-input textarea-large"
                            rows={8}
                        />
                        <button className="btn-small" onClick={saveContext} disabled={loading}>
                            {personalContext ? 'Update Context' : 'Save Context'}
                        </button>
                    </div>
                </div>

                {/* Proposal Rules Section */}
                <div className="settings-section">
                    <h3>Proposal Writing Rules</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Guidelines for how proposals should be structured and formatted.
                    </p>
                    <div className="add-form column">
                        <textarea
                            placeholder="Example: Keep it human & casual, 3-5 paragraphs max, include portfolio links..."
                            value={rulesContent}
                            onChange={(e) => setRulesContent(e.target.value)}
                            className="settings-input textarea-large"
                            rows={10}
                        />
                        <button className="btn-small" onClick={saveRules} disabled={loading}>
                            {proposalRules ? 'Update Rules' : 'Save Rules'}
                        </button>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="settings-section">
                    <h3>Portfolio Items</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        AI will automatically select the most relevant portfolio items for each job.
                    </p>
                    <div className="add-form column">
                        <input
                            type="text"
                            placeholder="Project Title"
                            value={newPortfolio.title}
                            onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                            className="settings-input"
                        />
                        <input
                            type="text"
                            placeholder="Link URL"
                            value={newPortfolio.link}
                            onChange={(e) => setNewPortfolio({ ...newPortfolio, link: e.target.value })}
                            className="settings-input"
                        />
                        <textarea
                            placeholder="Description (what skills/tools/platforms this demonstrates)"
                            value={newPortfolio.description}
                            onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                            className="settings-input textarea-small"
                        />
                        <button className="btn-small" onClick={addPortfolio} disabled={loading}>Add Portfolio</button>
                    </div>
                    <ul className="items-list">
                        {portfolio.map((item) => (
                            <li key={item.id} className="list-item column">
                                <div className="item-header">
                                    <strong>{item.title}</strong>
                                    <button className="delete-btn" onClick={() => removePortfolio(item.id)}>×</button>
                                </div>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link">{item.link}</a>
                                <p className="item-preview">{item.description}</p>
                            </li>
                        ))}
                        {!loading && portfolio.length === 0 && <p className="empty-text">No portfolio items found.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
