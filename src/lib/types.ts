export interface ChatMessage {
  id: number
  content: string
  sender: 'user' | 'assistant'
  timestamp: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  url?: string
  lastModified: string
}

export interface ChatResponse {
  response: string
  error?: string
}

export interface UploadResponse {
  files?: Document[]
  error?: string
}

export interface DeleteResponse {
  success?: boolean
  error?: string
}