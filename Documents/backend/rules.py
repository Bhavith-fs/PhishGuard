"""
Phishing Detection Rules Module
Contains heuristic-based rules for detecting phishing attempts
"""

import re
from urllib.parse import urlparse
from typing import List, Dict, Tuple

class PhishingRules:
    """Collection of phishing detection rules with scoring"""
    
    def __init__(self):
        # Suspicious keywords for email content
        self.suspicious_keywords = [
            'urgent', 'verify', 'suspended', 'account', 'login', 'password',
            'bank', 'security', 'update', 'confirm', 'click here', 'immediate',
            'action required', 'limited time', 'expire', 'blocked', 'unusual activity'
        ]
        
        # Suspicious TLDs
        self.suspicious_tlds = [
            '.tk', '.ml', '.ga', '.cf', '.pw', '.cc', '.biz', '.info'
        ]
        
        # URL shorteners
        self.url_shorteners = [
            'bit.ly', 'tinyurl.com', 'short.link', 't.co', 'goo.gl',
            'ow.ly', 'bit.do', 'mcaf.ee', 'buff.ly', 'adf.ly'
        ]
        
        # High-risk domains
        self.high_risk_domains = [
            'paypal', 'amazon', 'microsoft', 'apple', 'google', 'facebook',
            'instagram', 'twitter', 'linkedin', 'bank', 'chase', 'wellsfargo'
        ]

    def check_url_suspicious_keywords(self, url: str) -> Tuple[int, List[str]]:
        """Check for suspicious keywords in URL"""
        score = 0
        triggered = []
        url_lower = url.lower()
        
        for keyword in self.suspicious_keywords:
            if keyword in url_lower:
                score += 15
                triggered.append(f"Suspicious keyword in URL: '{keyword}'")
        
        return score, triggered

    def check_ip_based_url(self, url: str) -> Tuple[int, List[str]]:
        """Check if URL uses IP address instead of domain"""
        score = 0
        triggered = []
        
        # Extract domain from URL
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            
            # Check if domain is an IP address
            ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
            if re.match(ip_pattern, domain):
                score += 40
                triggered.append("URL uses IP address instead of domain name")
        except:
            pass
        
        return score, triggered

    def check_excessive_subdomains(self, url: str) -> Tuple[int, List[str]]:
        """Check for excessive subdomains"""
        score = 0
        triggered = []
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            
            # Count dots in domain (excluding www)
            subdomain_count = domain.count('.')
            if subdomain_count > 3:
                score += 20
                triggered.append(f"Excessive subdomains detected: {subdomain_count} dots")
        except:
            pass
        
        return score, triggered

    def check_suspicious_tld(self, url: str) -> Tuple[int, List[str]]:
        """Check for suspicious top-level domains"""
        score = 0
        triggered = []
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            for tld in self.suspicious_tlds:
                if domain.endswith(tld):
                    score += 25
                    triggered.append(f"Suspicious TLD detected: {tld}")
                    break
        except:
            pass
        
        return score, triggered

    def check_url_shortener(self, url: str) -> Tuple[int, List[str]]:
        """Check if URL uses URL shortening service"""
        score = 0
        triggered = []
        
        url_lower = url.lower()
        
        for shortener in self.url_shorteners:
            if shortener in url_lower:
                score += 30
                triggered.append(f"URL shortener detected: {shortener}")
                break
        
        return score, triggered

    def check_domain_spoofing(self, url: str) -> Tuple[int, List[str]]:
        """Check for potential domain spoofing of high-risk domains"""
        score = 0
        triggered = []
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            
            for high_risk in self.high_risk_domains:
                if high_risk in domain and not domain.startswith(f"www.{high_risk}"):
                    score += 35
                    triggered.append(f"Potential domain spoofing: contains '{high_risk}'")
                    break
        except:
            pass
        
        return score, triggered

    def check_email_suspicious_keywords(self, content: str) -> Tuple[int, List[str]]:
        """Check for suspicious keywords in email content"""
        score = 0
        triggered = []
        content_lower = content.lower()
        
        keyword_count = 0
        found_keywords = []
        
        for keyword in self.suspicious_keywords:
            if keyword in content_lower:
                keyword_count += 1
                found_keywords.append(keyword)
        
        if keyword_count > 0:
            score = min(keyword_count * 10, 50)  # Cap at 50 points
            triggered.append(f"Suspicious keywords found: {', '.join(found_keywords[:5])}")
            if len(found_keywords) > 5:
                triggered.append(f"... and {len(found_keywords) - 5} more")
        
        return score, triggered

    def check_email_urgency_indicators(self, content: str) -> Tuple[int, List[str]]:
        """Check for urgency indicators in email content"""
        score = 0
        triggered = []
        content_lower = content.lower()
        
        urgency_phrases = [
            'act now', 'immediate action', 'account will be closed', 'suspended immediately',
            'limited time', 'offer expires', 'urgent response needed', 'within 24 hours'
        ]
        
        for phrase in urgency_phrases:
            if phrase in content_lower:
                score += 20
                triggered.append(f"Urgency indicator: '{phrase}'")
        
        return score, triggered

    def check_email_link_mismatch(self, content: str) -> Tuple[int, List[str]]:
        """Check for mismatch between visible text and actual links in email"""
        score = 0
        triggered = []
        
        # Simple regex to find markdown-style links or HTML links
        link_patterns = [
            r'\[([^\]]+)\]\(([^)]+)\)',  # Markdown: [text](url)
            r'<a[^>]+href="([^"]+)"[^>]*>([^<]+)</a>'  # HTML: <a href="url">text</a>
        ]
        
        for pattern in link_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if len(match) == 2:
                    text, url = match[1], match[0] if pattern.startswith(r'\[') else match[0]
                    # Check if visible text is a legitimate domain but URL is suspicious
                    for high_risk in self.high_risk_domains:
                        if high_risk in text.lower() and high_risk not in url.lower():
                            score += 40
                            triggered.append(f"Link mismatch: text shows '{high_risk}' but URL differs")
                            break
        
        return score, triggered

    def analyze_url(self, url: str) -> Dict:
        """Analyze a URL for phishing indicators"""
        total_score = 0
        all_triggered = []
        
        # Apply URL-specific rules
        rules = [
            self.check_url_suspicious_keywords(url),
            self.check_ip_based_url(url),
            self.check_excessive_subdomains(url),
            self.check_suspicious_tld(url),
            self.check_url_shortener(url),
            self.check_domain_spoofing(url)
        ]
        
        for score, triggered in rules:
            total_score += score
            all_triggered.extend(triggered)
        
        return {
            'score': min(total_score, 100),  # Cap at 100
            'triggered_rules': all_triggered
        }

    def analyze_email(self, content: str) -> Dict:
        """Analyze email content for phishing indicators"""
        total_score = 0
        all_triggered = []
        
        # Apply email-specific rules
        rules = [
            self.check_email_suspicious_keywords(content),
            self.check_email_urgency_indicators(content),
            self.check_email_link_mismatch(content)
        ]
        
        for score, triggered in rules:
            total_score += score
            all_triggered.extend(triggered)
        
        return {
            'score': min(total_score, 100),  # Cap at 100
            'triggered_rules': all_triggered
        }
