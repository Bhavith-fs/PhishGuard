/**
 * PhishGuard Frontend JavaScript
 * Handles user interactions, API communication, and UI updates
 */

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const STORAGE_KEY = 'phishguard_history';

// DOM Elements
const elements = {
    form: document.getElementById('analysisForm'),
    inputType: document.getElementById('inputType'),
    userInput: document.getElementById('userInput'),
    inputLabel: document.getElementById('inputLabel'),
    charCount: document.getElementById('charCount'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    loadingState: document.getElementById('loadingState'),
    resultsSection: document.getElementById('resultsSection'),
    riskScore: document.getElementById('riskScore'),
    riskLevel: document.getElementById('riskLevel'),
    riskBarFill: document.getElementById('riskBarFill'),
    analysisSummary: document.getElementById('analysisSummary'),
    triggeredRulesContainer: document.getElementById('triggeredRulesContainer'),
    triggeredRulesList: document.getElementById('triggeredRulesList'),
    exportBtn: document.getElementById('exportBtn'),
    newAnalysisBtn: document.getElementById('newAnalysisBtn'),
    historySection: document.getElementById('historySection'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    closeModal: document.getElementById('closeModal'),
    aboutBtn: document.getElementById('aboutBtn'),
    helpBtn: document.getElementById('helpBtn')
};

// State management
let currentAnalysis = null;
let analysisHistory = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadHistory();
    updateHistoryDisplay();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Form submission
    elements.form.addEventListener('submit', handleFormSubmit);
    
    // Input type change
    elements.inputType.addEventListener('change', handleInputTypeChange);
    
    // Character counter
    elements.userInput.addEventListener('input', updateCharCount);
    
    // Action buttons
    elements.exportBtn.addEventListener('click', exportReport);
    elements.newAnalysisBtn.addEventListener('click', startNewAnalysis);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Modal controls
    elements.closeModal.addEventListener('click', closeModal);
    elements.aboutBtn.addEventListener('click', () => showModal('about'));
    elements.helpBtn.addEventListener('click', () => showModal('help'));
    
    // Close modal on background click
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const inputType = elements.inputType.value;
    const inputText = elements.userInput.value.trim();
    
    if (!inputText) {
        showError('Please enter content to analyze');
        return;
    }
    
    // Validate URL if URL type
    if (inputType === 'url' && !isValidUrl(inputText)) {
        showError('Please enter a valid URL');
        return;
    }
    
    await performAnalysis(inputType, inputText);
}

/**
 * Handle input type change
 */
function handleInputTypeChange() {
    const inputType = elements.inputType.value;
    const userInput = elements.userInput;
    const inputLabel = elements.inputLabel;
    
    if (inputType === 'url') {
        inputLabel.textContent = 'Enter URL to analyze:';
        userInput.placeholder = 'https://example.com/login';
        userInput.style.fontFamily = "'Inter', monospace";
    } else {
        inputLabel.textContent = 'Enter email content to analyze:';
        userInput.placeholder = 'Paste your email content here...';
        userInput.style.fontFamily = "'Inter', sans-serif";
    }
    
    // Clear previous results
    hideResults();
}

/**
 * Update character counter
 */
function updateCharCount() {
    const count = elements.userInput.value.length;
    elements.charCount.textContent = count;
}

/**
 * Perform phishing analysis
 */
async function performAnalysis(inputType, inputText) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: inputType,
                input: inputText
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Analysis failed');
        }
        
        const result = await response.json();
        currentAnalysis = {
            ...result,
            input: inputText,
            inputType: inputType,
            timestamp: new Date().toISOString()
        };
        
        displayResults(currentAnalysis);
        saveToHistory(currentAnalysis);
        updateHistoryDisplay();
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError(error.message || 'Failed to analyze content. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Display analysis results
 */
function displayResults(analysis) {
    // Update risk score and level
    elements.riskScore.textContent = analysis.score;
    elements.riskLevel.textContent = analysis.risk_level;
    elements.riskLevel.className = `risk-level ${analysis.risk_level.toLowerCase()}`;
    
    // Update risk bar
    elements.riskBarFill.style.width = `${analysis.score}%`;
    elements.riskBarFill.className = `risk-bar-fill ${analysis.risk_level.toLowerCase()}`;
    
    // Update analysis summary
    elements.analysisSummary.textContent = analysis.analysis_summary;
    
    // Display triggered rules
    if (analysis.triggered_rules && analysis.triggered_rules.length > 0) {
        elements.triggeredRulesContainer.classList.remove('hidden');
        elements.triggeredRulesList.innerHTML = '';
        
        analysis.triggered_rules.forEach(rule => {
            const li = document.createElement('li');
            li.textContent = rule;
            elements.triggeredRulesList.appendChild(li);
        });
    } else {
        elements.triggeredRulesContainer.classList.add('hidden');
    }
    
    // Show results section
    elements.resultsSection.classList.remove('hidden');
    
    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Show loading state
 */
function showLoading() {
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.innerHTML = `
        <div class="spinner-small"></div>
        Analyzing...
    `;
    elements.loadingState.classList.remove('hidden');
    hideResults();
}

/**
 * Hide loading state
 */
function hideLoading() {
    elements.analyzeBtn.disabled = false;
    elements.analyzeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>
        Analyze
    `;
    elements.loadingState.classList.add('hidden');
}

/**
 * Hide results section
 */
function hideResults() {
    elements.resultsSection.classList.add('hidden');
}

/**
 * Export analysis report
 */
function exportReport() {
    if (!currentAnalysis) return;
    
    const report = {
        timestamp: currentAnalysis.timestamp,
        input_type: currentAnalysis.inputType,
        input: currentAnalysis.input,
        risk_level: currentAnalysis.risk_level,
        risk_score: currentAnalysis.score,
        triggered_rules: currentAnalysis.triggered_rules,
        analysis_summary: currentAnalysis.analysis_summary
    };
    
    // Create downloadable file
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `phishguard_report_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

/**
 * Start new analysis
 */
function startNewAnalysis() {
    elements.form.reset();
    elements.userInput.value = '';
    updateCharCount();
    hideResults();
    elements.userInput.focus();
}

/**
 * Save analysis to history
 */
function saveToHistory(analysis) {
    analysisHistory.unshift(analysis);
    
    // Keep only last 50 items
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analysisHistory));
}

/**
 * Load analysis history
 */
function loadHistory() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            analysisHistory = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to load history:', e);
            analysisHistory = [];
        }
    }
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
    if (analysisHistory.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No analysis history yet</p>';
        return;
    }
    
    elements.historyList.innerHTML = '';
    
    analysisHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.addEventListener('click', () => loadHistoryItem(item));
        
        const date = new Date(item.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-type">${item.inputType}</span>
                <span class="history-item-score ${item.risk_level.toLowerCase()}">${item.score}/100</span>
            </div>
            <div class="history-item-content">${item.input.substring(0, 100)}${item.input.length > 100 ? '...' : ''}</div>
            <div class="history-item-date">${dateStr}</div>
        `;
        
        elements.historyList.appendChild(historyItem);
    });
}

/**
 * Load history item
 */
function loadHistoryItem(item) {
    currentAnalysis = item;
    elements.inputType.value = item.inputType;
    elements.userInput.value = item.input;
    handleInputTypeChange();
    updateCharCount();
    displayResults(item);
}

/**
 * Clear history
 */
function clearHistory() {
    if (confirm('Are you sure you want to clear all analysis history?')) {
        analysisHistory = [];
        localStorage.removeItem(STORAGE_KEY);
        updateHistoryDisplay();
    }
}

/**
 * Show modal
 */
function showModal(type) {
    if (type === 'about') {
        elements.modalTitle.textContent = 'About PhishGuard';
        elements.modalBody.innerHTML = `
            <h4>What is PhishGuard?</h4>
            <p>PhishGuard is an educational cybersecurity tool designed to help identify potential phishing attempts using rule-based analysis and heuristics.</p>
            
            <h4>How it works</h4>
            <p>The tool analyzes URLs and email content for suspicious patterns including:</p>
            <ul>
                <li>Suspicious keywords and phrases</li>
                <li>URL anomalies and IP-based addresses</li>
                <li>Domain spoofing attempts</li>
                <li>Urgency indicators</li>
                <li>Link mismatches in emails</li>
            </ul>
            
            <h4>Risk Scoring</h4>
            <p><strong>Low Risk (0-39):</strong> Few or no suspicious indicators detected.</p>
            <p><strong>Medium Risk (40-69):</strong> Some suspicious indicators present. Exercise caution.</p>
            <p><strong>High Risk (70-100):</strong> Multiple suspicious indicators. Likely a phishing attempt.</p>
            
            <h4>Important Note</h4>
            <p>This tool is for educational purposes only. Always verify suspicious content through official channels and use comprehensive security solutions.</p>
        `;
    } else if (type === 'help') {
        elements.modalTitle.textContent = 'How to Use PhishGuard';
        elements.modalBody.innerHTML = `
            <h4>Getting Started</h4>
            <ol>
                <li>Select the input type (URL or Email Content)</li>
                <li>Enter the URL or paste the email content</li>
                <li>Click "Analyze" to start the detection</li>
                <li>Review the results and risk assessment</li>
            </ol>
            
            <h4>URL Analysis</h4>
            <p>When analyzing URLs, PhishGuard checks for:</p>
            <ul>
                <li>IP-based URLs instead of domain names</li>
                <li>Excessive subdomains</li>
                <li>Suspicious top-level domains</li>
                <li>URL shortener usage</li>
                <li>Domain spoofing attempts</li>
            </ul>
            
            <h4>Email Analysis</h4>
            <p>When analyzing email content, PhishGuard checks for:</p>
            <ul>
                <li>Suspicious keywords and urgency phrases</li>
                <li>Mismatch between link text and actual URLs</li>
                <li>Phishing indicators in the content</li>
            </ul>
            
            <h4>Features</h4>
            <ul>
                <li><strong>History:</strong> View and reload previous analyses</li>
                <li><strong>Export:</strong> Download analysis reports as JSON</li>
                <li><strong>Risk Visualization:</strong> Visual risk score and level indicators</li>
            </ul>
            
            <h4>Tips</h4>
            <ul>
                <li>Always verify suspicious emails through official channels</li>
                <li>Look for spelling and grammar errors</li>
                <li>Check sender email addresses carefully</li>
                <li>Never click on suspicious links</li>
                <li>Keep your security software updated</li>
            </ul>
        `;
    }
    
    elements.modal.classList.remove('hidden');
}

/**
 * Close modal
 */
function closeModal() {
    elements.modal.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <div class="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for error notification
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-color);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    const errorContent = errorDiv.querySelector('.error-content');
    errorContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 300);
    }, 5000);
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Add CSS animations for error notifications
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .spinner-small {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
