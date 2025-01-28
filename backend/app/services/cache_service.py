import redis.asyncio as redis
import json
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import logging
import pickle
from datetime import timedelta

load_dotenv()
logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.redis = redis.from_url(self.redis_url, decode_responses=True)
        
        # Cache timeouts
        self.TIMEOUTS = {
            "analysis": timedelta(hours=24),
            "document": timedelta(hours=12),
            "comparison": timedelta(hours=6)
        }

    async def get_analysis_cache(self, document_id: str, analysis_type: str) -> Optional[Dict[str, Any]]:
        """
        Get cached analysis results
        """
        try:
            key = f"analysis:{document_id}:{analysis_type}"
            cached = await self.redis.get(key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"Error getting from cache: {str(e)}")
            return None

    async def set_analysis_cache(self, document_id: str, analysis_type: str, result: Dict[str, Any]):
        """
        Cache analysis results
        """
        try:
            key = f"analysis:{document_id}:{analysis_type}"
            await self.redis.setex(
                key,
                self.TIMEOUTS["analysis"],
                json.dumps(result)
            )
        except Exception as e:
            logger.error(f"Error setting cache: {str(e)}")

    async def get_document_cache(self, document_id: str) -> Optional[bytes]:
        """
        Get cached document content
        """
        try:
            key = f"document:{document_id}"
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"Error getting document from cache: {str(e)}")
            return None

    async def set_document_cache(self, document_id: str, content: bytes):
        """
        Cache document content
        """
        try:
            key = f"document:{document_id}"
            await self.redis.setex(
                key,
                self.TIMEOUTS["document"],
                content
            )
        except Exception as e:
            logger.error(f"Error caching document: {str(e)}")

    async def get_comparison_cache(self, doc1_id: str, doc2_id: str) -> Optional[Dict[str, Any]]:
        """
        Get cached document comparison results
        """
        try:
            key = f"comparison:{doc1_id}:{doc2_id}"
            cached = await self.redis.get(key)
            if cached:
                return json.loads(cached)
            return None
        except Exception as e:
            logger.error(f"Error getting comparison from cache: {str(e)}")
            return None

    async def set_comparison_cache(self, doc1_id: str, doc2_id: str, result: Dict[str, Any]):
        """
        Cache document comparison results
        """
        try:
            key = f"comparison:{doc1_id}:{doc2_id}"
            await self.redis.setex(
                key,
                self.TIMEOUTS["comparison"],
                json.dumps(result)
            )
        except Exception as e:
            logger.error(f"Error caching comparison: {str(e)}")

    async def invalidate_document_cache(self, document_id: str):
        """
        Invalidate all caches related to a document
        """
        try:
            # Get all keys related to this document
            pattern = f"*:{document_id}*"
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
        except Exception as e:
            logger.error(f"Error invalidating cache: {str(e)}")

    async def get_processing_status(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Get document processing status from cache
        """
        try:
            key = f"processing_status:{document_id}"
            status = await self.redis.get(key)
            return json.loads(status) if status else None
        except Exception as e:
            logger.error(f"Error getting processing status: {str(e)}")
            return None

    async def set_processing_status(self, document_id: str, status: Dict[str, Any]):
        """
        Update document processing status in cache
        """
        try:
            key = f"processing_status:{document_id}"
            await self.redis.set(key, json.dumps(status))
        except Exception as e:
            logger.error(f"Error setting processing status: {str(e)}")

    async def close(self):
        """
        Close Redis connection
        """
        await self.redis.close()
