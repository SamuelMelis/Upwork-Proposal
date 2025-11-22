import React from 'react';
import './JobInput.css';

const JobInput = ({ value, onChange, onGenerate, isGenerating }) => {
    return (
        <div className="job-input-container glass-panel fade-in">
            <h2 className="section-title">Job Brief</h2>
            <textarea
                className="job-textarea"
                placeholder="Paste the Upwork job description here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isGenerating}
            />
            <div className="action-bar">
                <button
                    className="btn-primary generate-btn"
                    onClick={onGenerate}
                    disabled={!value.trim() || isGenerating}
                >
                    {isGenerating ? (
                        <span className="loading-text">
                            <span className="spinner"></span> Processing...
                        </span>
                    ) : (
                        "Generate Proposal"
                    )}
                </button>
            </div>
        </div>
    );
};

export default JobInput;
