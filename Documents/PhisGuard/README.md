# PhishGuard - Phishing Detection Tool

A cybersecurity-focused web application that helps users identify potentially malicious phishing URLs and email content using rule-based and heuristic analysis.

## 🎯 Features

### Core Functionality
- **Dual Input Support**: Analyze both URLs and email content
- **Rule-Based Detection**: Uses heuristic analysis without machine learning
- **Risk Scoring**: Provides risk scores (0-100) and levels (Low/Medium/High)
- **Detailed Analysis**: Shows specific triggered rules and indicators
- **Real-time Analysis**: Fast client-server communication

### User Interface
- **Modern Cybersecurity Theme**: Dark mode with blue accent colors
- **Responsive Design**: Works on desktop and mobile devices
- **Visual Risk Indicators**: Color-coded risk levels and progress bars
- **Analysis History**: Stores previous scans in browser localStorage
- **Export Reports**: Download analysis results as JSON

### Security Features
- **URL Analysis**: Detects IP-based URLs, excessive subdomains, suspicious TLDs
- **Domain Spoofing**: Identifies potential impersonation attempts
- **Email Content Analysis**: Finds suspicious keywords and urgency indicators
- **Link Mismatch Detection**: Checks for discrepancies between text and actual URLs

## 🏗️ Project Structure

```
PhishGuard/
├── frontend/
│   ├── index.html      # Main HTML structure
│   ├── style.css       # Cybersecurity-themed styling
│   └── script.js       # Frontend JavaScript functionality
│
├── backend/
│   ├── app.py          # Flask-based REST API
│   ├── rules.py        # Phishing detection rules and scoring
│   └── utils.py        # Utility functions and helpers
│
└── README.md           # This documentation
```

## 🚀 Getting Started

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)
- Modern web browser

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install required packages:**
   ```bash
   pip install flask flask-cors
   ```

4. **Start the backend server:**
   ```bash
   python app.py
   ```

   The API server will start on `http://localhost:5000`

### Frontend Setup

1. **Open the frontend in your browser:**
   - Navigate to the `frontend` directory
   - Open `index.html` in your web browser
   - Or use a simple HTTP server:
     ```bash
     cd frontend
     python -m http.server 8000
     ```
     Then visit `http://localhost:8000`

## 🔧 API Endpoints

### Analyze Content
```
POST /api/analyze
Content-Type: application/json

{
  "type": "url" | "email",
  "input": "URL or email content to analyze"
}
```

**Response:**
```json
{
  "risk_level": "Low" | "Medium" | "High",
  "score": 0-100,
  "triggered_rules": ["List of triggered detection rules"],
  "input_type": "url" | "email",
  "analysis_summary": "Human-readable summary"
}
```

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "PhishGuard API",
  "version": "1.0.0"
}
```

## 🛡️ Detection Rules

### URL Analysis Rules
1. **Suspicious Keywords** (15 points each)
   - Words like: urgent, verify, login, password, bank, etc.

2. **IP-based URLs** (40 points)
   - URLs using IP addresses instead of domain names

3. **Excessive Subdomains** (20 points)
   - More than 3 dots in the domain

4. **Suspicious TLDs** (25 points)
   - Top-level domains like .tk, .ml, .ga, .cf, etc.

5. **URL Shorteners** (30 points)
   - Services like bit.ly, tinyurl.com, etc.

6. **Domain Spoofing** (35 points)
   - Contains high-risk domain names but isn't legitimate

### Email Analysis Rules
1. **Suspicious Keywords** (10 points each, max 50)
   - Phishing-related words in email content

2. **Urgency Indicators** (20 points each)
   - Phrases creating false urgency

3. **Link Mismatch** (40 points)
   - Discrepancy between visible text and actual URLs

### Risk Levels
- **Low Risk (0-39)**: Few or no suspicious indicators
- **Medium Risk (40-69)**: Some suspicious indicators present
- **High Risk (70-100)**: Multiple suspicious indicators, likely phishing

## 💡 Usage Examples

### URL Analysis
1. Select "URL" from the dropdown
2. Enter a suspicious URL like: `http://192.168.1.1/secure-login`
3. Click "Analyze"
4. Review the risk assessment and triggered rules

### Email Analysis
1. Select "Email Content" from the dropdown
2. Paste suspicious email content
3. Click "Analyze"
4. Check for phishing indicators and urgency tactics

## 🔒 Security Considerations

### What PhishGuard Detects
- Common phishing patterns and tactics
- URL anomalies and suspicious structures
- Social engineering indicators
- Domain impersonation attempts

### Limitations
- **Educational Tool Only**: Not a replacement for professional security software
- **Rule-Based**: May miss sophisticated or novel phishing techniques
- **No Real-time Data**: Doesn't check against current threat intelligence
- **False Positives**: Legitimate content may sometimes trigger alerts

### Best Practices
- Always verify through official channels
- Use comprehensive security solutions
- Keep software and browsers updated
- Enable multi-factor authentication
- Stay educated about current phishing tactics

## 🎨 Customization

### Adding New Rules
Edit `backend/rules.py` to add custom detection rules:

```python
def custom_rule(self, content: str) -> Tuple[int, List[str]]:
    score = 0
    triggered = []
    
    # Your custom logic here
    if "suspicious_pattern" in content.lower():
        score += 25
        triggered.append("Custom suspicious pattern detected")
    
    return score, triggered
```

### Modifying Risk Scores
Adjust the point values in each rule to change detection sensitivity.

### Customizing UI
Modify `frontend/style.css` to change colors, layouts, and visual elements.

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the Flask server is running on port 5000
   - Check for firewall blocking the connection

2. **CORS Errors**
   - The backend includes CORS support
   - Ensure both frontend and backend are served from web servers

3. **Invalid URL Format**
   - URLs must include protocol (http:// or https://)
   - Check for typos in the URL

4. **History Not Saving**
   - Check browser localStorage permissions
   - Clear browser cache if needed

### Debug Mode
Enable debug mode in `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

## 📚 Educational Resources

### Phishing Awareness
- [Anti-Phishing Working Group](https://apwg.org/)
- [Federal Trade Commission - Phishing](https://www.consumer.ftc.gov/articles/how-recognize-and-avoid-phishing-scams)
- [CISA Phishing Guidance](https://www.cisa.gov/stop-look-phish)

### Cybersecurity Learning
- [Cybrary](https://www.cybrary.it/)
- [TryHackMe](https://tryhackme.com/)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)

## 🤝 Contributing

This is an educational project. Contributions are welcome for:
- New detection rules
- UI/UX improvements
- Documentation enhancements
- Bug fixes

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is provided for educational purposes. Use responsibly and in accordance with applicable laws and regulations.

## ⚠️ Disclaimer

PhishGuard is an educational tool designed to demonstrate phishing detection concepts. It is not a substitute for professional cybersecurity solutions. Always:

- Verify suspicious content through official channels
- Use comprehensive security software
- Consult security professionals for critical decisions
- Stay informed about current security threats

The creators are not responsible for any security incidents that may occur while using this tool.

## 📞 Support

For questions, issues, or suggestions:
- Check the troubleshooting section
- Review the educational resources
- Consult with cybersecurity professionals

---

**Stay Safe Online! 🛡️**
