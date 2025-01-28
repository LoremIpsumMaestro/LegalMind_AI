from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query
from typing import List, Optional
from pydantic import BaseModel, UUID4
from datetime import datetime
from ..dependencies import get_current_user, get_db
from ..models.document import Document
from ..services.document_service import DocumentService

router = APIRouter()

class DocumentBase(BaseModel):
    title: str
    document_type: str
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime
    status: str
    file_path: str

    class Config:
        orm_mode = True

@router.post("/", response_model=DocumentResponse)
async def create_document(
    document: DocumentCreate,
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Upload a new legal document with metadata.
    """
    try:
        document_service = DocumentService(db)
        return await document_service.create_document(document, file, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID4,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Retrieve a specific document by ID.
    """
    document_service = DocumentService(db)
    document = await document_service.get_document(document_id, current_user)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    document_type: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    List all documents with optional filtering and pagination.
    """
    document_service = DocumentService(db)
    return await document_service.list_documents(
        skip=skip,
        limit=limit,
        document_type=document_type,
        user=current_user
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID4,
    document: DocumentUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update document metadata.
    """
    document_service = DocumentService(db)
    updated_document = await document_service.update_document(
        document_id,
        document,
        current_user
    )
    if not updated_document:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated_document

@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID4,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Delete a document.
    """
    document_service = DocumentService(db)
    success = await document_service.delete_document(document_id, current_user)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"status": "success", "message": "Document deleted"}

@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: UUID4,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Trigger AI analysis of a document.
    """
    document_service = DocumentService(db)
    analysis = await document_service.analyze_document(document_id, current_user)
    if not analysis:
        raise HTTPException(status_code=404, detail="Document not found")
    return analysis
