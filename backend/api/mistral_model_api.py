from flask import Blueprint, request, jsonify
from src.llm_models.mistral_handler import MistralModelHandler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Mistral Model
try:
    mistral_model = MistralModelHandler(
        model_name='mistralai/Mistral-7B-Instruct-v0.1',
        quantization=True
    )
except Exception as e:
    logger.error(f"Failed to initialize Mistral model: {e}")
    mistral_model = None

# Create Flask blueprint for Mistral model API
mistral_model_bp = Blueprint('mistral_model', __name__)

@mistral_model_bp.route('/generate', methods=['POST'])
def generate_text():
    """
    Endpoint for generating text using Mistral AI model
    """
    if not mistral_model:
        return jsonify({
            'error': 'Mistral model not initialized',
            'status': 'error'
        }), 500

    # Get request data
    data = request.json
    prompt = data.get('prompt')
    generation_type = data.get('type', 'text-generation')

    # Validate input
    if not prompt:
        return jsonify({
            'error': 'Prompt is required',
            'status': 'error'
        }), 400

    try:
        # Handle different generation types
        if generation_type == 'text-generation':
            generated_texts = mistral_model.generate_text(
                prompt, 
                max_length=300, 
                temperature=0.7
            )
        elif generation_type == 'legal-query':
            generated_texts = [mistral_model.legal_query_response(
                query=prompt, 
                context="Legal assistant context"
            )]
        elif generation_type == 'document-analysis':
            generated_texts = [mistral_model.legal_document_analysis(
                document_text=prompt, 
                analysis_type='summary'
            )]
        else:
            return jsonify({
                'error': 'Invalid generation type',
                'status': 'error'
            }), 400

        # Return first generated text
        return jsonify({
            'generated_text': generated_texts[0] if generated_texts else '',
            'status': 'success'
        })

    except Exception as e:
        logger.error(f"Text generation error: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Error handling middleware
@mistral_model_bp.errorhandler(Exception)
def handle_error(error):
    """
    Global error handler for the Mistral model blueprint
    """
    logger.error(f"Unexpected error in Mistral model API: {error}")
    return jsonify({
        'error': 'An unexpected error occurred',
        'status': 'error'
    }), 500
