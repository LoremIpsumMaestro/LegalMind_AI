// API client utilities for making requests to our backend

export async function sendChatMessage(message: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending chat message:', error)
    throw error
  }
}

export async function uploadDocuments(files: FileList) {
  try {
    const formData = new FormData()
    
    Array.from(files).forEach((file) => {
      formData.append('documents', file)
    })

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading documents:', error)
    throw error
  }
}

export async function deleteDocument(documentId: string) {
  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Delete failed')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting document:', error)
    throw error
  }
}