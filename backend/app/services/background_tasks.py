from typing import Optional, Dict, Any
import asyncio
from celery import Celery
from celery.result import AsyncResult
import logging
from .document_processor import DocumentProcessor
from .cache_service import CacheService
from ..models.document import Document, DocumentStatus
from ..database import get_db
import os
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'tasks',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/1'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')
)

celery_app.conf.task_routes = {
    'document_processing': {'queue': 'document_processing'},
    'document_comparison': {'queue': 'document_comparison'}
}

class BackgroundTaskService:
    def __init__(self):
        self.cache = CacheService()

    @celery_app.task(name='document_processing')
    def process_document_task(self, document_id: str):
        """
        Celery task for document processing
        """
        try:
            db = next(get_db())
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document:
                raise ValueError(f"Document not found: {document_id}")

            processor = DocumentProcessor(db)
            loop = asyncio.get_event_loop()
            
            # Process document
            result = loop.run_until_complete(
                processor.process_document(document, document.file_path)
            )

            # Cache results
            loop.run_until_complete(
                self.cache.set_analysis_cache(
                    document_id,
                    "complete",
                    result
                )
            )

            return result

        except Exception as e:
            logger.error(f"Error in background processing: {str(e)}")
            if document:
                document.update_status(DocumentStatus.ERROR)
                document.metadata['error'] = str(e)
                db.commit()
            raise

    @celery_app.task(name='document_comparison')
    def compare_documents_task(self, doc1_id: str, doc2_id: str):
        """
        Celery task for document comparison
        """
        try:
            db = next(get_db())
            doc1 = db.query(Document).filter(Document.id == doc1_id).first()
            doc2 = db.query(Document).filter(Document.id == doc2_id).first()

            if not doc1 or not doc2:
                raise ValueError("One or both documents not found")

            processor = DocumentProcessor(db)
            loop = asyncio.get_event_loop()
            
            # Compare documents
            result = loop.run_until_complete(
                processor.compare_document_versions(doc1, doc2)
            )

            # Cache comparison results
            loop.run_until_complete(
                self.cache.set_comparison_cache(doc1_id, doc2_id, result)
            )

            return result

        except Exception as e:
            logger.error(f"Error in document comparison: {str(e)}")
            raise

    async def schedule_document_processing(self, document: Document) -> str:
        """
        Schedule document processing in background
        """
        try:
            # Check cache first
            cached_result = await self.cache.get_analysis_cache(
                str(document.id),
                "complete"
            )
            if cached_result:
                return cached_result

            # Schedule processing
            task = self.process_document_task.delay(str(document.id))
            
            # Store task ID in document metadata
            document.metadata['task_id'] = task.id
            return task.id

        except Exception as e:
            logger.error(f"Error scheduling document processing: {str(e)}")
            raise

    async def schedule_document_comparison(self, doc1_id: str, doc2_id: str) -> str:
        """
        Schedule document comparison in background
        """
        try:
            # Check cache first
            cached_result = await self.cache.get_comparison_cache(doc1_id, doc2_id)
            if cached_result:
                return cached_result

            # Schedule comparison
            task = self.compare_documents_task.delay(doc1_id, doc2_id)
            return task.id

        except Exception as e:
            logger.error(f"Error scheduling document comparison: {str(e)}")
            raise

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get background task status
        """
        try:
            task_result = AsyncResult(task_id, app=celery_app)
            
            status = {
                'task_id': task_id,
                'status': task_result.status,
                'result': task_result.result if task_result.ready() else None
            }

            if task_result.failed():
                status['error'] = str(task_result.result)

            return status

        except Exception as e:
            logger.error(f"Error getting task status: {str(e)}")
            return {
                'task_id': task_id,
                'status': 'ERROR',
                'error': str(e)
            }

    async def cancel_task(self, task_id: str) -> bool:
        """
        Cancel a running background task
        """
        try:
            celery_app.control.revoke(task_id, terminate=True)
            return True
        except Exception as e:
            logger.error(f"Error cancelling task: {str(e)}")
            return False