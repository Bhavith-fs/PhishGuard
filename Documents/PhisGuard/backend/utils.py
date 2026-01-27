"""
Utility functions for PhishGuard backend
"""

import re
from urllib.parse import urlparse
from typing import Optional

def is_valid_url(url: str) -> bool:
    """Check if the input string is a valid URL"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def extract_urls_from_text(text: str) -> list:
    """Extract all URLs from text content"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    urls = re.findall(url_pattern, text)
    return urls

def clean_text(text: str) -> str:
    """Clean and normalize text input"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_risk_level(score: int) -> str:
    """Convert risk score to risk level"""
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    else:
        return "Low"

def format_analysis_result(score: int, triggered_rules: list, input_type: str) -> dict:
    """Format the analysis result into a standardized response"""
    return {
        'risk_level': get_risk_level(score),
        'score': score,
        'triggered_rules': triggered_rules,
        'input_type': input_type,
        'analysis_summary': generate_summary(score, len(triggered_rules))
    }

def generate_summary(score: int, rule_count: int) -> str:
    """Generate a human-readable summary of the analysis"""
    if score >= 70:
        return f"High risk detected! {rule_count} suspicious indicators found. This appears to be a phishing attempt."
    elif score >= 40:
        return f"Medium risk detected. {rule_count} suspicious indicators found. Exercise caution."
    else:
        return f"Low risk detected. {rule_count} suspicious indicators found. Appears relatively safe."
