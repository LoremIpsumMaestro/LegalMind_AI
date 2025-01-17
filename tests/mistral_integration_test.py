import unittest
import sys
import os
import logging

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.llm_models.mistral_handler import MistralModelHandler

class TestMistralModelIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """
        Set up logging and initialize the Mistral model once for all tests
        """
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        cls.logger = logging.getLogger(__name__)
        
        try:
            cls.mistral_model = MistralModelHandler(
                model_name='mistralai/Mistral-7B-Instruct-v0.1',
                quantization=True
            )
        except Exception as e:
            cls.logger.error(f"Failed to initialize Mistral model: {e}")
            raise

    def test_model_initialization(self):
        """
        Verify that the Mistral model is initialized correctly
        """
        self.assertIsNotNone(self.mistral_model, "Mistral model should be initialized")
        self.assertIsNotNone(self.mistral_model.model, "Model should be loaded")
        self.assertIsNotNone(self.mistral_model.tokenizer, "Tokenizer should be loaded")

    def test_text_generation(self):
        """
        Test basic text generation functionality
        """
        prompt = "Explain the basic principles of contract law in three sentences."
        generated_texts = self.mistral_model.generate_text(prompt)
        
        self.assertIsNotNone(generated_texts, "Generated texts should not be None")
        self.assertTrue(len(generated_texts) > 0, "At least one generated text should be produced")
        
        # Log the generated text for manual review
        self.logger.info("Generated Text:")
        for text in generated_texts:
            self.logger.info(text)
            self.assertTrue(len(text) > len(prompt), "Generated text should be longer than the prompt")

    def test_legal_document_analysis(self):
        """
        Test legal document analysis functionality
        """
        sample_contract = """
        EMPLOYMENT AGREEMENT

        This Employment Agreement (the "Agreement") is entered into on January 17, 2025, 
        by and between TechCorp Inc. ("Employer") and Jane Doe ("Employee").

        1. Position: Senior Software Engineer
        2. Compensation: $120,000 per annum
        3. Term: 2 years with option for renewal
        4. Confidentiality: Employee agrees to maintain strict confidentiality
        """

        # Test different analysis types
        analysis_types = ['summary', 'risks', 'compliance']
        
        for analysis_type in analysis_types:
            with self.subTest(analysis_type=analysis_type):
                analysis_result = self.mistral_model.legal_document_analysis(
                    sample_contract, 
                    analysis_type=analysis_type
                )
                
                self.assertIsNotNone(analysis_result, f"{analysis_type} analysis should not be None")
                self.assertTrue(len(analysis_result) > 50, f"{analysis_type} analysis should be substantive")
                
                # Log the analysis for manual review
                self.logger.info(f"{analysis_type.capitalize()} Analysis:")
                self.logger.info(analysis_result)

    def test_legal_query_response(self):
        """
        Test legal query response functionality
        """
        legal_queries = [
            "What are the key elements of a valid contract?",
            "Explain the difference between civil and criminal law",
            "What constitutes a breach of employment contract?"
        ]

        for query in legal_queries:
            with self.subTest(query=query):
                response = self.mistral_model.legal_query_response(
                    query=query,
                    context="General legal principles"
                )
                
                self.assertIsNotNone(response, "Query response should not be None")
                self.assertTrue(len(response) > 50, "Response should be substantive")
                
                # Log the response for manual review
                self.logger.info(f"Query: {query}")
                self.logger.info("Response:")
                self.logger.info(response)

    def test_generation_parameters(self):
        """
        Test different text generation parameters
        """
        prompt = "Draft a brief professional legal communication."
        
        # Test various temperature settings
        temperature_tests = [0.2, 0.5, 0.8]
        for temp in temperature_tests:
            with self.subTest(temperature=temp):
                generated_texts = self.mistral_model.generate_text(
                    prompt, 
                    temperature=temp,
                    max_length=200
                )
                
                self.assertIsNotNone(generated_texts, f"Generated texts should not be None for temp {temp}")
                self.assertTrue(len(generated_texts) > 0, f"At least one text should be generated for temp {temp}")

def run_tests():
    """
    Run the test suite and log results
    """
    # Create a test loader and runner
    test_loader = unittest.TestLoader()
    test_suite = test_loader.loadTestsFromTestCase(TestMistralModelIntegration)
    
    # Run the tests
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    # Return True if tests pass, False otherwise
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
