import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ currentProposal, onProposalUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message to chat
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsProcessing(true);

        try {
            // Import editProposal dynamically to avoid circular dependencies
            const { editProposal } = await import('../utils/gemini');

            // Call AI to edit the proposal
            const updatedProposal = await editProposal(currentProposal, userMessage, newMessages);

            // Add AI response to chat
            setMessages([...newMessages, {
                role: 'assistant',
                content: 'I\'ve updated your proposal based on your request.'
            }]);

            // Update the proposal in parent component
            onProposalUpdate(updatedProposal);

        } catch (error) {
            console.error('Error editing proposal:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-interface">
            <div className="chat-header">
                <h3>✨ Refine Your Proposal</h3>
                <p>Ask me to make changes (e.g., "make it shorter", "add more about After Effects")</p>
            </div>

            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <p>💬 Start a conversation to refine your proposal</p>
                        <div className="suggestion-chips">
                            <button onClick={() => setInputValue('Make it more concise')}>Make it more concise</button>
                            <button onClick={() => setInputValue('Sound more professional')}>Sound more professional</button>
                            <button onClick={() => setInputValue('Add more enthusiasm')}>Add more enthusiasm</button>
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                        <div className="message-content">
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="chat-message assistant">
                        <div className="message-content">
                            <span className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <textarea
                    className="chat-input"
                    placeholder="Ask me to edit the proposal..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isProcessing}
                    rows={1}
                />
                <button
                    className="chat-send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isProcessing}
                >
                    {isProcessing ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
