import os
import time
from typing import List, Optional, Dict
import requests
from dotenv import load_dotenv

class HuggingFaceTokenManager:
    """
    Manages Hugging Face API tokens with advanced features
    """
    
    def __init__(
        self, 
        tokens: Optional[List[str]] = None, 
        cache_duration: int = 3600,
        log_file: Optional[str] = None
    ):
        """
        Initialize the Hugging Face Token Manager
        
        :param tokens: List of Hugging Face API tokens
        :param cache_duration: Duration to cache successful token (in seconds)
        :param log_file: Path to log file for tracking token usage
        """
        # Load tokens from environment if not provided
        load_dotenv()
        
        self.tokens = tokens or self._load_tokens_from_env()
        if not self.tokens:
            raise ValueError("No Hugging Face API tokens found")
        
        self.current_token_index = 0
        self.token_usage = {token: {'last_used': 0, 'error_count': 0} for token in self.tokens}
        self.cache_duration = cache_duration
        self.log_file = log_file
    
    def _load_tokens_from_env(self) -> List[str]:
        """
        Load Hugging Face tokens from environment variables
        """
        token_vars = [
            'HUGGINGFACE_API_TOKENS',
            'HUGGINGFACE_API_TOKEN',
            'HF_API_TOKENS',
            'HF_API_TOKEN'
        ]
        
        for var in token_vars:
            tokens_str = os.getenv(var)
            if tokens_str:
                return [t.strip() for t in tokens_str.split(',') if t.strip()]
        
        return []
    
    def get_token(self) -> str:
        """
        Retrieve an available token, rotating through the list
        """
        current_time = time.time()
        
        # Find a token with low error count and not recently used
        for i in range(len(self.tokens)):
            token_index = (self.current_token_index + i) % len(self.tokens)
            token = self.tokens[token_index]
            token_info = self.token_usage[token]
            
            if (current_time - token_info['last_used'] > self.cache_duration and 
                token_info['error_count'] < 3):
                self.current_token_index = token_index
                token_info['last_used'] = current_time
                return token
        
        # If no token is available, use next token
        self.current_token_index = (self.current_token_index + 1) % len(self.tokens)
        current_token = self.tokens[self.current_token_index]
        self.token_usage[current_token]['last_used'] = current_time
        return current_token
    
    def report_token_error(self, token: Optional[str] = None):
        """
        Report an error with the current or specified token
        """
        if token is None:
            token = self.tokens[self.current_token_index]
        
        self.token_usage[token]['error_count'] += 1
    
    def validate_token(self, token: Optional[str] = None) -> bool:
        """
        Validate a Hugging Face API token
        """
        if token is None:
            token = self.tokens[self.current_token_index]
        
        try:
            response = requests.get(
                'https://huggingface.co/api/whoami-v2', 
                headers={'Authorization': f'Bearer {token}'}
            )
            return response.status_code == 200
        except requests.RequestException:
            return False
