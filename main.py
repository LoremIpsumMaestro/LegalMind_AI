import os
import logging
from dotenv import load_dotenv

from src.api_monitoring.token_manager import HuggingFaceTokenManager
from src.api_monitoring.api_wrapper import HuggingFaceAPIWrapper

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
        # Initialize token manager
        token_manager = HuggingFaceTokenManager(
            tokens=os.getenv('HUGGINGFACE_API_TOKENS', '').split(',')
        )

        # Initialize API wrapper
        api_wrapper = HuggingFaceAPIWrapper(
            token_manager=token_manager,
            logger=logger
        )

        # Example: Legal document analysis
        try:
            # Text generation for contract analysis
            contract_analysis_prompt = (
                "Analyze the following legal contract terms for potential risks "
                "and provide a concise summary of key points:"
            )
            
            generated_text = api_wrapper.text_generation(
                model='bert-legal-analysis',  # Replace with actual model
                prompt=contract_analysis_prompt,
                max_length=300
            )
            
            logger.info("Contract Analysis Result:")
            logger.info(generated_text)

            # Named Entity Recognition for legal entities
            sample_legal_text = (
                "John Doe, representing Acme Corporation, entered into a contract "
                "with Smith & Partners LLP on January 15, 2024."
            )
            
            ner_results = api_wrapper.named_entity_recognition(
                model='legal-ner-model',  # Replace with actual model
                text=sample_legal_text
            )
            
            logger.info("Named Entities Detected:")
            for entity in ner_results:
                logger.info(f"Entity: {entity.get('word', 'N/A')} | "
                             f"Type: {entity.get('entity', 'N/A')}")

            # Text classification for contract type
            contract_classification = api_wrapper.text_classification(
                model='legal-contract-classifier',  # Replace with actual model
                text=sample_legal_text
            )
            
            logger.info("Contract Classification:")
            for classification in contract_classification:
                logger.info(f"Label: {classification.get('label', 'N/A')} | "
                             f"Score: {classification.get('score', 'N/A')}")

        except Exception as analysis_error:
            logger.error(f"Legal document analysis error: {analysis_error}")
            raise

    except Exception as setup_error:
        logger.error(f"Setup error: {setup_error}")
        raise

if __name__ == '__main__':
    main()
