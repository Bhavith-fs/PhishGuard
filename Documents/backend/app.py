"""
PhishGuard Backend API
Flask-based REST API for phishing detection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from rules import PhishingRules
from utils import is_valid_url, clean_text, format_analysis_result

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize phishing detection rules
phishing_detector = PhishingRules()

@app.route('/api/analyze', methods=['POST'])
def analyze_input():
    """Analyze URL or email content for phishing indicators"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        input_text = data.get('input', '').strip()
        input_type = data.get('type', '').lower()
        
        if not input_text:
            return jsonify({'error': 'Input cannot be empty'}), 400
        
        if input_type not in ['url', 'email']:
            return jsonify({'error': 'Invalid input type. Must be "url" or "email"'}), 400
        
        # Clean input
        input_text = clean_text(input_text)
        
        # Perform analysis based on input type
        if input_type == 'url':
            # Validate URL
            if not is_valid_url(input_text):
                return jsonify({'error': 'Invalid URL format'}), 400
            
            # Analyze URL
            result = phishing_detector.analyze_url(input_text)
            
        else:  # email
            # Analyze email content
            result = phishing_detector.analyze_email(input_text)
        
        # Format and return result
        response = format_analysis_result(
            result['score'], 
            result['triggered_rules'], 
            input_type
        )
        
        logger.info(f"Analysis completed: {input_type} - Score: {result['score']} - Risk: {response['risk_level']}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'PhishGuard API',
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting PhishGuard API server...")
    print("Server will be available at: http://localhost:5000")
    print("API endpoints:")
    print("  POST /api/analyze - Analyze URL or email content")
    print("  GET  /api/health  - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
