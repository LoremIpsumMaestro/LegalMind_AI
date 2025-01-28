import os
from typing import Dict, Any, Optional, List
import magic
import pytesseract
from pdf2image import convert_from_path
import docx
import asyncio
import logging
from pathlib import Path
from .mistral_service import MistralService
from ..models.document import Document, DocumentStatus
from sqlalchemy.orm import Session
import aiofiles
import hashlib
import json

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.mistral = MistralService()
        self.allowed_types = {
            'application/pdf': '.pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'text/plain': '.txt'
        }
        self.upload_dir = os.getenv('UPLOAD_DIR', './uploads')
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)

    async def process_document(self, document: Document, file_path: str) -> Dict[str, Any]:
        """
        Main document processing pipeline
        """
        try:
            # Update status to processing
            document.update_status(DocumentStatus.PROCESSING)
            self.db.commit()

            # 1. Validate document
            mime_type = await self._get_mime_type(file_path)
            if mime_type not in self.allowed_types:
                raise ValueError(f"Unsupported file type: {mime_type}")

            # 2. Extract text
            text = await self._extract_text(file_path, mime_type)

            # 3. Generate file hash
            file_hash = await self._generate_file_hash(file_path)
            document.metadata['file_hash'] = file_hash

            # 4. Process the document
            tasks = [
                self.mistral.analyze_document(text, "summary"),
                self.mistral.analyze_document(text, "entities"),
                self.mistral.analyze_document(text, "clauses"),
                self.mistral.analyze_document(text, "risk_analysis")
            ]
            results = await asyncio.gather(*tasks)

            # 5. Combine results
            analysis_results = {
                result["analysis_type"]: result["result"]
                for result in results
            }

            # 6. Update document with results
            document.analysis_results = analysis_results
            document.update_status(DocumentStatus.PROCESSED)
            self.db.commit()

            return {
                "status": "success",
                "document_id": str(document.id),
                "analysis_results": analysis_results
            }

        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            document.update_status(DocumentStatus.ERROR)
            document.metadata['error'] = str(e)
            self.db.commit()
            raise

    async def _extract_text(self, file_path: str, mime_type: str) -> str:
        """
        Extract text from different document types
        """
        if mime_type == 'application/pdf':
            return await self._extract_text_from_pdf(file_path)
        elif mime_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return await self._extract_text_from_docx(file_path)
        elif mime_type == 'text/plain':
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as file:
                return await file.read()
        else:
            raise ValueError(f"Unsupported mime type for text extraction: {mime_type}")

    async def _extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text from PDF using OCR if necessary
        """
        try:
            # Try to extract text directly first
            async with aiofiles.open(file_path, 'rb') as file:
                pdf_content = await file.read()
                
            # If no text is extracted, use OCR
            if not pdf_content.strip():
                images = await asyncio.to_thread(convert_from_path, file_path)
                text_parts = []
                
                for image in images:
                    text = await asyncio.to_thread(
                        pytesseract.image_to_string,
                        image,
                        lang='eng'
                    )
                    text_parts.append(text)
                
                return '\n'.join(text_parts)
            
            return pdf_content.decode('utf-8', errors='ignore')
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    async def _extract_text_from_docx(self, file_path: str) -> str:
        """
        Extract text from DOCX files
        """
        try:
            doc = await asyncio.to_thread(docx.Document, file_path)
            return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            raise

    async def _get_mime_type(self, file_path: str) -> str:
        """
        Get MIME type of file
        """
        try:
            mime = magic.Magic(mime=True)
            return await asyncio.to_thread(mime.from_file, file_path)
        except Exception as e:
            logger.error(f"Error getting MIME type: {str(e)}")
            raise

    async def _generate_file_hash(self, file_path: str) -> str:
        """
        Generate SHA-256 hash of file
        """
        sha256_hash = hashlib.sha256()
        async with aiofiles.open(file_path, 'rb') as file:
            # Read file in chunks to handle large files
            chunk = await file.read(8192)
            while chunk:
                sha256_hash.update(chunk)
                chunk = await file.read(8192)
        return sha256_hash.hexdigest()

    async def compare_document_versions(self, doc1: Document, doc2: Document) -> Dict[str, Any]:
        """
        Compare two versions of a document
        """
        try:
            text1 = await self._extract_text(doc1.file_path, doc1.file_type)
            text2 = await self._extract_text(doc2.file_path, doc2.file_type)
            
            comparison_result = await self.mistral.compare_documents(text1, text2)
            
            return {
                "status": "success",
                "comparison": comparison_result["result"],
                "metadata": {
                    "doc1_id": str(doc1.id),
                    "doc2_id": str(doc2.id),
                    "comparison_timestamp": doc2.updated_at.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error comparing documents: {str(e)}")
            raise

    def get_processing_status(self, document: Document) -> Dict[str, Any]:
        """
        Get current processing status and results
        """
        return {
            "status": document.status.value,
            "metadata": document.metadata,
            "analysis_results": document.analysis_results,
            "last_updated": document.updated_at.isoformat()
        }
