import os
import time
import logging
from typing import Dict, Any, Optional, List
import requests
from .token_manager import HuggingFaceTokenManager

class HuggingFaceAPIWrapper:
    """
    Advanced API wrapper for Hugging Face interactions
    """
    
    def __init__(
        self, 
        token_manager: Optional[HuggingFaceTokenManager] = None,
        base_url: str = 'https://api-inference.huggingface.co',
        max_retries: int = 3,
        retry_delay: float = 1.0,
        logger: Optional[logging.Logger] = None
    ):
        """
        Initialize the API wrapper
        
        :param token_manager: Token management instance
        :param base_url: Base URL for Hugging Face API
        :param max_retries: Maximum number of retry attempts
        :param retry_delay: Delay between retries
        :param logger: Optional logger instance
        """
        self.token_manager = token_manager or HuggingFaceTokenManager()
        self.base_url = base_url.rstrip('/')
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
        # Logging setup
        self.logger = logger or logging.getLogger(__name__)
    
    def _prepare_headers(self, token: str) -> Dict[str, str]:
        """
        Prepare request headers
        
        :param token: API token
        :return: Headers dictionary
        """
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def make_request(
        self, 
        endpoint: str, 
        method: str = 'POST',
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        additional_headers: Optional[Dict[str, str]] = None
    ) -> Any:
        """
        Make a request to Hugging Face API with comprehensive error handling
        
        :param endpoint: API endpoint
        :param method: HTTP method
        :param params: Query parameters
        :param data: Request body
        :param additional_headers: Extra headers
        :return: API response
        """
        # Prepare full URL
        full_url = f"{self.base_url}{endpoint}"
        
        # Prepare request parameters
        request_params = {
            'url': full_url,
            'method': method,
            'params': params or {},
            'json': data,
            'headers': {}
        }
        
        # Attempt request with retries
        for attempt in range(self.max_retries):
            try:
                # Get token
                token = self.token_manager.get_token()
                
                # Prepare headers
                headers = self._prepare_headers(token)
                if additional_headers:
                    headers.update(additional_headers)
                request_params['headers'] = headers
                
                # Track start time
                start_time = time.time()
                
                # Make the request
                response = requests.request(**request_params)
                
                # Calculate response time
                response_time = time.time() - start_time
                
                # Log the request
                self.logger.info(
                    f"API Request: {endpoint} | "
                    f"Method: {method} | "
                    f"Status: {response.status_code} | "
                    f"Response Time: {response_time:.2f}s"
                )
                
                # Check response
                if response.status_code == 200:
                    return response.json()
                
                # Handle rate limiting
                if response.status_code == 429:
                    retry_after = float(response.headers.get('Retry-After', self.retry_delay))
                    time.sleep(retry_after)
                    continue
                
                # Raise for other error status codes
                response.raise_for_status()
            
            except requests.RequestException as e:
                # Log error
                self.logger.error(
                    f"API Error: {endpoint} | "
                    f"Attempt {attempt + 1} | "
                    f"Error: {str(e)}"
                )
                
                # Report token error
                self.token_manager.report_token_error()
                
                # Retry with exponential backoff
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (2 ** attempt))
                else:
                    raise
        
        raise RuntimeError("Max retries exceeded")
    
    def text_generation(
        self, 
        model: str, 
        prompt: str, 
        max_length: int = 250,
        **kwargs
    ) -> str:
        """
        Text generation API call
        
        :param model: Hugging Face model ID
        :param prompt: Input text prompt
        :param max_length: Maximum generated text length
        :param kwargs: Additional generation parameters
        :return: Generated text
        """
        data = {
            'inputs': prompt,
            'parameters': {
                'max_length': max_length,
                **kwargs
            }
        }
        
        response = self.make_request(
            endpoint=f'/models/{model}',
            method='POST',
            data=data
        )
        
        return response[0]['generated_text']
    
    def text_classification(
        self, 
        model: str, 
        text: str
    ) -> List[Dict[str, float]]:
        """
        Text classification API call
        
        :param model: Hugging Face model ID
        :param text: Text to classify
        :return: Classification results
        """
        response = self.make_request(
            endpoint=f'/models/{model}',
            method='POST',
            data={'inputs': text}
        )
        
        return response
    
    def named_entity_recognition(
        self, 
        model: str, 
        text: str
    ) -> List[Dict[str, Any]]:
        """
        Named Entity Recognition API call
        
        :param model: Hugging Face model ID
        :param text: Text for NER
        :return: NER results
        """
        response = self.make_request(
            endpoint=f'/models/{model}',
            method='POST',
            data={'inputs': text}
        )
        
        return response
