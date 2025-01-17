import os
import logging
from dotenv import load_dotenv

from src.api_monitoring.token_manager import HuggingFaceTokenManager
from src.llm_models.mistral_handler import MistralModelHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('legalai.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    # Load environment variables
    load_dotenv()

    try:
        # Initialize Hugging Face Token Manager (for model access)
        token_manager = HuggingFaceTokenManager(
            tokens=os.getenv('HUGGINGFACE_API_TOKENS', '').split(',')
        )

        # Initialize Mistral Model
        try:
            mistral_model = MistralModelHandler(
                model_name='mistralai/Mistral-7B-Instruct-v0.1',
                quantization=True  # Enable memory-efficient loading
            )

            # Example 1: Legal Document Summary
            sample_contract = """
            EMPLOYMENT AGREEMENT

            This Employment Agreement (the "Agreement") is entered into on January 17, 2025, 
            by and between TechCorp Inc. ("Employer") and Jane Doe ("Employee").

            1. Position: Senior Software Engineer
            2. Compensation: $120,000 per annum
            3. Term: 2 years with option for renewal
            4. Confidentiality: Employee agrees to maintain strict confidentiality
            """

            logger.info("Generating Legal Document Analysis:")
            document_analysis = mistral_model.legal_document_analysis(
                sample_contract, 
                analysis_type='summary'
            )
            logger.info(document_analysis)

            # Example 2: Legal Query Response
            legal_query = "What are the key considerations when drafting a non-compete clause?"
            logger.info("\nLegal Query Response:")
            query_response = mistral_model.legal_query_response(
                query=legal_query,
                context="Technology startup employment agreement"
            )
            logger.info(query_response)

            # Example 3: Text Generation with Specific Instructions
            custom_prompt = (
                "Draft a professional email explaining a minor breach of "
                "contract and proposing a resolution."
            )
            logger.info("\nCustom Text Generation:")
            generated_texts = mistral_model.generate_text(
                custom_prompt, 
                max_length=300, 
                temperature=0.6
            )
            for text in generated_texts:
                logger.info(text)

        except Exception as model_error:
            logger.error(f"Mistral model initialization error: {model_error}")
            raise

    except Exception as setup_error:
        logger.error(f"Setup error: {setup_error}")
        raise

if __name__ == '__main__':
    main()
