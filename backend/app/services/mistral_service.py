from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()
logger = logging.getLogger(__name__)

class MistralService:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        self.model = os.getenv("MISTRAL_MODEL", "mistral-medium")
        self.client = MistralClient(api_key=self.api_key)

        # System prompts for different analysis types
        self.ANALYSIS_PROMPTS = {
            "summary": """You are a legal document analyzer. Provide a concise summary of the following document, 
            highlighting key points, obligations, and any potential risks. Format your response in markdown.""",
            
            "entities": """Identify and list all legal entities mentioned in the document, including their roles 
            and relationships. Include any relevant jurisdiction information.""",
            
            "clauses": """Analyze and list all significant legal clauses in the document. For each clause, 
            provide: 1) Type of clause, 2) Summary of obligations, 3) Any conditions or triggers, 
            4) Potential risks or implications.""",
            
            "risk_analysis": """Conduct a comprehensive risk analysis of the document. Identify potential legal, 
            business, and compliance risks. Rate each risk on a scale of 1-5 and provide mitigation suggestions."""
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def analyze_document(self, text: str, analysis_type: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze a document using Mistral AI
        """
        try:
            system_prompt = self.ANALYSIS_PROMPTS.get(analysis_type, self.ANALYSIS_PROMPTS["summary"])
            
            messages = [
                ChatMessage(role="system", content=system_prompt),
                ChatMessage(role="user", content=text)
            ]

            # Add context if provided
            if context:
                context_msg = f"Additional context: {str(context)}"
                messages.insert(1, ChatMessage(role="system", content=context_msg))

            response = await self.client.chat_completions(
                model=self.model,
                messages=messages,
                temperature=0.3,
                max_tokens=2000
            )

            return {
                "analysis_type": analysis_type,
                "result": response.choices[0].message.content,
                "model_used": self.model,
                "metadata": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }

        except Exception as e:
            logger.error(f"Error in Mistral analysis: {str(e)}")
            raise

    async def process_large_document(self, text: str, chunk_size: int = 4000) -> Dict[str, Any]:
        """
        Process a large document by breaking it into chunks and analyzing each chunk
        """
        chunks = self._split_text(text, chunk_size)
        analyses = []

        for chunk in chunks:
            chunk_analysis = await self.analyze_document(chunk, "summary")
            analyses.append(chunk_analysis)

        # Combine the analyses
        combined_analysis = self._combine_analyses(analyses)
        return combined_analysis

    async def compare_documents(self, doc1: str, doc2: str) -> Dict[str, Any]:
        """
        Compare two documents and identify key differences
        """
        comparison_prompt = """Compare the following two legal documents. Identify:
        1. Key differences in terms and conditions
        2. Changes in obligations or rights
        3. Any additions or removals of clauses
        4. Changes in risk profile
        Format your response in markdown with clear sections."""

        messages = [
            ChatMessage(role="system", content=comparison_prompt),
            ChatMessage(role="user", content=f"Document 1:\n{doc1}\n\nDocument 2:\n{doc2}")
        ]

        response = await self.client.chat_completions(
            model=self.model,
            messages=messages,
            temperature=0.3,
            max_tokens=2000
        )

        return {
            "analysis_type": "comparison",
            "result": response.choices[0].message.content,
            "model_used": self.model,
            "metadata": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }

    def _split_text(self, text: str, chunk_size: int) -> List[str]:
        """
        Split text into chunks of specified size while preserving paragraph structure
        """
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""

        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) <= chunk_size:
                current_chunk += paragraph + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = paragraph + "\n\n"

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    def _combine_analyses(self, analyses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Combine multiple analyses into a single coherent analysis
        """
        combined_text = "\n\n".join([analysis["result"] for analysis in analyses])
        
        messages = [
            ChatMessage(role="system", content="Synthesize the following document analyses into a single coherent summary:"),
            ChatMessage(role="user", content=combined_text)
        ]

        response = self.client.chat_completions(
            model=self.model,
            messages=messages,
            temperature=0.3,
            max_tokens=2000
        )

        return {
            "analysis_type": "combined_analysis",
            "result": response.choices[0].message.content,
            "model_used": self.model,
            "metadata": {
                "original_chunks": len(analyses),
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }
