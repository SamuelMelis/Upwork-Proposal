import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useTelegram from '../hooks/useTelegram';
import '../components/SettingsPanel.css'; // Reusing styles for now, might need adjustment

const SettingsPage = () => {
    const navigate = useNavigate();
    const { isTelegram, showBackButton, hideBackButton, hapticFeedback } = useTelegram();

    // Supabase State
    const [categories, setCategories] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Local Form State
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [newProposal, setNewProposal] = useState({ title: '', content: '', category_id: '' });
    const [newPortfolio, setNewPortfolio] = useState({ title: '', link: '', description: '', category_id: '' });

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
            const { data: cats, error: catError } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
            if (catError) throw catError;

            const { data: props, error: propError } = await supabase.from('proposals').select('*').order('created_at', { ascending: true });
            if (propError) throw propError;

            const { data: ports, error: portError } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: true });
            if (portError) throw portError;

            setCategories(cats || []);
            setProposals(props || []);
            setPortfolio(ports || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const addCategory = async () => {
        if (!newCategory.name.trim()) return;
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: newCategory.name.trim(), description: newCategory.description }])
                .select();

            if (error) throw error;
            if (data) {
                setCategories([...categories, data[0]]);
                setNewCategory({ name: '', description: '' });
            }
        } catch (err) {
            alert('Error adding category: ' + err.message);
        }
    };

    const removeCategory = async (id) => {
        if (!window.confirm("Delete this category? This will also delete linked proposals and portfolio items.")) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            setCategories(categories.filter(c => c.id !== id));
            setProposals(proposals.filter(p => p.category_id !== id));
            setPortfolio(portfolio.filter(p => p.category_id !== id));
        } catch (err) {
            alert('Error deleting category: ' + err.message);
        }
    };

    const addProposal = async () => {
        if (!newProposal.title.trim() || !newProposal.content.trim()) return;
        if (!newProposal.category_id) {
            alert("Please select a category.");
            return;
        }
        try {
            const { data, error } = await supabase
                .from('proposals')
                .insert([{
                    title: newProposal.title,
                    content: newProposal.content,
                    category_id: newProposal.category_id
                }])
                .select();

            if (error) throw error;
            if (data) {
                setProposals([...proposals, data[0]]);
                setNewProposal({ title: '', content: '', category_id: '' });
            }
        } catch (err) {
            alert('Error adding proposal: ' + err.message);
        }
    };

    const removeProposal = async (id) => {
        try {
            const { error } = await supabase.from('proposals').delete().eq('id', id);
            if (error) throw error;
            setProposals(proposals.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting proposal:', err);
        }
    };

    const addPortfolio = async () => {
        if (!newPortfolio.title.trim() || !newPortfolio.link.trim()) return;
        if (!newPortfolio.category_id) {
            alert("Please select a category.");
            return;
        }
        try {
            const { data, error } = await supabase
                .from('portfolio_items')
                .insert([{
                    title: newPortfolio.title,
                    link: newPortfolio.link,
                    description: newPortfolio.description,
                    category_id: newPortfolio.category_id
                }])
                .select();

            if (error) throw error;
            if (data) {
                setPortfolio([...portfolio, data[0]]);
                setNewPortfolio({ title: '', link: '', description: '', category_id: '' });
            }
        } catch (err) {
            alert('Error adding portfolio: ' + err.message);
        }
    };

    const removePortfolio = async (id) => {
        try {
            const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
            if (error) throw error;
            setPortfolio(portfolio.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting portfolio:', err);
        }
    };

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : 'Unknown Category';
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

                {/* Categories Section */}
                <div className="settings-section">
                    <h3>Job Categories</h3>
                    <div className="add-form column">
                        <input
                            type="text"
                            placeholder="Category Name (e.g. Video Editing)"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            className="settings-input"
                        />
                        <textarea
                            placeholder="Description / Keywords..."
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            className="settings-input textarea-small"
                        />
                        <button className="btn-small" onClick={addCategory} disabled={loading}>Add Category</button>
                    </div>
                    <ul className="items-list">
                        {categories.map((cat) => (
                            <li key={cat.id} className="list-item column">
                                <div className="item-header">
                                    <strong>{cat.name}</strong>
                                    <button className="delete-btn" onClick={() => removeCategory(cat.id)}>×</button>
                                </div>
                                {cat.description && <p className="item-preview">{cat.description}</p>}
                            </li>
                        ))}
                        {!loading && categories.length === 0 && <p className="empty-text">No categories found.</p>}
                    </ul>
                </div>

                {/* Winning Proposals Section */}
                <div className="settings-section">
                    <h3>Winning Proposals</h3>
                    <div className="add-form column">
                        <select
                            className="settings-input"
                            value={newProposal.category_id}
                            onChange={(e) => setNewProposal({ ...newProposal, category_id: e.target.value })}
                        >
                            <option value="">Select Category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Proposal Title"
                            value={newProposal.title}
                            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                            className="settings-input"
                        />
                        <textarea
                            placeholder="Proposal Content..."
                            value={newProposal.content}
                            onChange={(e) => setNewProposal({ ...newProposal, content: e.target.value })}
                            className="settings-input textarea-small"
                        />
                        <button className="btn-small" onClick={addProposal} disabled={loading}>Add Proposal</button>
                    </div>
                    <ul className="items-list">
                        {proposals.map((prop) => (
                            <li key={prop.id} className="list-item column">
                                <div className="item-header">
                                    <strong>{prop.title}</strong>
                                    <button className="delete-btn" onClick={() => removeProposal(prop.id)}>×</button>
                                </div>
                                <span className="category-badge">{getCategoryName(prop.category_id)}</span>
                                <p className="item-preview">{prop.content.substring(0, 50)}...</p>
                            </li>
                        ))}
                        {!loading && proposals.length === 0 && <p className="empty-text">No proposals found.</p>}
                    </ul>
                </div>

                {/* Portfolio Section */}
                <div className="settings-section">
                    <h3>Portfolio Links</h3>
                    <div className="add-form column">
                        <select
                            className="settings-input"
                            value={newPortfolio.category_id}
                            onChange={(e) => setNewPortfolio({ ...newPortfolio, category_id: e.target.value })}
                        >
                            <option value="">Select Category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
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
                            placeholder="Description (keywords)..."
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
                                <span className="category-badge">{getCategoryName(item.category_id)}</span>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link">{item.link}</a>
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
