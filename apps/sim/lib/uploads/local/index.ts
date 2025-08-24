import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { UPLOAD_DIR } from '@/lib/uploads/setup'
import { FileInfo } from '@/lib/uploads/storage-client'

const METADATA_FILE = path.join(process.cwd(), 'dev-storage.json')

interface DevStorageMetadata {
  [key: string]: FileInfo
}

async function readMetadata(): Promise<DevStorageMetadata> {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

async function writeMetadata(metadata: DevStorageMetadata): Promise<void> {
  await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
}

export async function uploadFileToLocal(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<FileInfo> {
  const metadata = await readMetadata()
  const fileId = uuidv4()
  const key = `${fileId}-${fileName}`
  const filePath = path.join(UPLOAD_DIR, key)

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.writeFile(filePath, file)

  const fileInfo: FileInfo = {
    path: filePath,
    key,
    name: fileName,
    size: file.length,
    type: contentType,
  }

  metadata[key] = fileInfo
  await writeMetadata(metadata)

  return fileInfo
}

export async function downloadFileFromLocal(key: string): Promise<Buffer> {
  const metadata = await readMetadata()
  const fileInfo = metadata[key]

  if (!fileInfo) {
    throw new Error('File not found')
  }

  return fs.readFile(fileInfo.path)
}

export async function deleteFileFromLocal(key: string): Promise<void> {
  const metadata = await readMetadata()
  const fileInfo = metadata[key]

  if (!fileInfo) {
    return
  }

  await fs.unlink(fileInfo.path)
  delete metadata[key]
  await writeMetadata(metadata)
}
