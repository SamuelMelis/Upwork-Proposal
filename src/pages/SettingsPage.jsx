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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Local Form State
    const [newPortfolio, setNewPortfolio] = useState({ title: '', link: '', description: '' });

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

            setPortfolio(ports || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
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

                {/* Portfolio Section */}
                <div className="settings-section" style={{ borderBottom: 'none' }}>
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
