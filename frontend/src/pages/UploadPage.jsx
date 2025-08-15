import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import { 
  Upload as UploadIcon, 
  File, 
  Image, 
  FileText, 
  Download,
  Trash2,
  Eye,
  X,
  AlertCircle
} from 'lucide-react'

const UploadPage = () => {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const { data: uploadsData } = useQuery('uploads', () => api.getUploads({ limit: 20 }))
  const { data: statsData } = useQuery('upload-stats', api.getUploadStats)

  const uploadMutation = useMutation(api.uploadFiles, {
    onSuccess: () => {
      toast.success('Files uploaded successfully!')
      queryClient.invalidateQueries('uploads')
      queryClient.invalidateQueries('upload-stats')
      queryClient.invalidateQueries('account')
      setSelectedFiles([])
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to upload files'
      toast.error(message)
    },
    onSettled: () => {
      setUploading(false)
    }
  })

  const deleteMutation = useMutation(api.deleteUpload, {
    onSuccess: () => {
      toast.success('File deleted successfully!')
      queryClient.invalidateQueries('uploads')
      queryClient.invalidateQueries('upload-stats')
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to delete file'
      toast.error(message)
    }
  })

  const onDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer?.files || e.target.files || [])
    
    // Filter and validate files
    const validFiles = files.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'text/plain', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/json'
      ]
      
      if (!validTypes.includes(file.type)) {
        toast.error(`File type ${file.type} not supported`)
        return false
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`)
        return false
      }
      
      return true
    }).slice(0, 5) // Max 5 files
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)
    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })

    uploadMutation.mutate(formData)
  }

  const handleDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId)
    }
  }

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return Image
    }
    if (mimetype === 'application/pdf') {
      return FileText
    }
    return File
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploads = uploadsData?.data.files || []
  const stats = statsData?.data.stats || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">File Upload</h1>
        <p className="text-gray-600">Upload and manage your files securely</p>
      </div>

      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <UploadIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total_files || 0}</p>
            <p className="text-sm text-gray-600">Total Files</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats.total_size_mb || 0} MB</p>
            <p className="text-sm text-gray-600">Total Size</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <Image className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {stats.file_types?.length || 0}
            </p>
            <p className="text-sm text-gray-600">File Types</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
        </div>
        <div className="card-body">
          <div
            onDrop={onDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
          >
            <input
              type="file"
              multiple
              onChange={onDrop}
              className="hidden"
              id="file-upload"
              accept="image/*,.txt,.pdf,.doc,.docx,.json"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports: Images, PDF, DOC, TXT, JSON (Max 5MB each, 5 files max)
              </p>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Selected Files</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedFiles([])}
                  className="btn-secondary"
                >
                  Clear All
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="card border-yellow-200 bg-yellow-50">
        <div className="card-body">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                All uploaded files are scanned for security threats. Executable files and potentially dangerous content are automatically blocked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Your Files</h3>
        </div>
        <div className="card-body">
          {uploads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploads.map((file) => {
                const FileIcon = getFileIcon(file.mimetype)
                return (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <FileIcon className="h-8 w-8 text-gray-400" />
                      <div className="flex space-x-2">
                        {file.mimetype.startsWith('image/') && (
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <a
                          href={file.url}
                          download={file.original_name}
                          className="text-green-600 hover:text-green-800"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                      {file.original_name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(file.size)} • {file.mimetype}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <UploadIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
              <p className="text-gray-600">Start by uploading your first file above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadPage
