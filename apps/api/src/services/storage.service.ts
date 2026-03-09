import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface StorageService {
  uploadFile(params: {
    buffer: Buffer
    filename: string
    mimeType: string
    folder: string    // path relative to base upload dir
  }): Promise<{ url: string; fileId: string }>

  deleteFile(fileId: string): Promise<void>
}

class LocalStorageService implements StorageService {
  private baseDir: string

  constructor() {
    // baseDir is apps/api/uploads
    this.baseDir = path.resolve(__dirname, '../../uploads')
  }

  async uploadFile(params: {
    buffer: Buffer
    filename: string
    mimeType: string
    folder: string
  }): Promise<{ url: string; fileId: string }> {
    const targetDir = path.join(this.baseDir, params.folder)
    
    // Ensure directory exists
    await fs.mkdir(targetDir, { recursive: true })

    const timestamp = Date.now()
    const safeFilename = `${timestamp}-${params.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const targetPath = path.join(targetDir, safeFilename)

    await fs.writeFile(targetPath, params.buffer)

    // Return a relative URL or a full URL if API_URL is defined
    const relativePath = path.join(params.folder, safeFilename).replace(/\\/g, '/')
    const url = `/uploads/${relativePath}`

    return {
      url,
      fileId: relativePath // For local storage, the relative path acts as fileId
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const targetPath = path.join(this.baseDir, fileId)
    try {
      await fs.unlink(targetPath)
    } catch (error) {
      console.error(`❌ Failed to delete file: ${fileId}`, error)
    }
  }
}

// In the future, we can add GoogleDriveStorageService or S3StorageService here
export const storage: StorageService = new LocalStorageService()
