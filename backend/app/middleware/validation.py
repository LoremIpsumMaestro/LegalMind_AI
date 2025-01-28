from fastapi import Request, HTTPException
from typing import Callable, Awaitable
import re
import json
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

class RequestValidationMiddleware:
    def __init__(
        self,
        app,
        max_content_length: int = 10 * 1024 * 1024  # 10MB default
    ):
        self.app = app
        self.max_content_length = max_content_length
        
        # Compile regex patterns for validation
        self.patterns = {
            'document_id': re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
            'email': re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
            'filename': re.compile(r'^[\w\-. ]+$')
        }

    async def __call__(self, request: Request, call_next: Callable[[Request], Awaitable]) -> Response:
        try:
            # Validate request size
            if request.headers.get('content-length'):
                content_length = int(request.headers['content-length'])
                if content_length > self.max_content_length:
                    raise HTTPException(
                        status_code=413,
                        detail="Request too large"
                    )

            # Validate path parameters
            path_params = request.path_params
            for param_name, param_value in path_params.items():
                if param_name == 'document_id' and not self.patterns['document_id'].match(str(param_value)):
                    raise HTTPException(
                        status_code=422,
                        detail=f"Invalid {param_name} format"
                    )

            # Validate query parameters
            query_params = request.query_params
            for param_name, param_value in query_params.items():
                if param_name == 'email' and not self.patterns['email'].match(str(param_value)):
                    raise HTTPException(
                        status_code=422,
                        detail=f"Invalid {param_name} format"
                    )

            # For file uploads, validate file name and type
            if request.headers.get('content-type', '').startswith('multipart/form-data'):
                form = await request.form()
                for field_name, field_value in form.items():
                    if hasattr(field_value, 'filename'):
                        if not self.patterns['filename'].match(field_value.filename):
                            raise HTTPException(
                                status_code=422,
                                detail="Invalid filename format"
                            )
                        
                        # Validate file type
                        allowed_types = ['.pdf', '.doc', '.docx', '.txt']
                        if not any(field_value.filename.lower().endswith(ext) for ext in allowed_types):
                            raise HTTPException(
                                status_code=422,
                                detail="Unsupported file type"
                            )

            # Sanitize and validate JSON body
            if request.headers.get('content-type') == 'application/json':
                body = await request.body()
                if body:
                    try:
                        json_data = json.loads(body)
                        # Additional JSON validation could be added here
                    except json.JSONDecodeError:
                        raise HTTPException(
                            status_code=422,
                            detail="Invalid JSON format"
                        )

            response = await call_next(request)
            return response

        except ValidationError as e:
            logger.error(f"Validation error: {str(e)}")
            return JSONResponse(
                status_code=422,
                content={"detail": str(e)}
            )
        except HTTPException as e:
            logger.error(f"HTTP exception: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error in validation middleware: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Internal server error"
            )
