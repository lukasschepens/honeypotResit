import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import { FileText, ArrowLeft } from 'lucide-react'

const schema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title must be less than 200 characters'),
  content: yup
    .string()
    .required('Content is required')
    .min(1, 'Content must be at least 1 character')
    .max(5000, 'Content must be less than 5000 characters'),
})

const CreatePostPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const createPostMutation = useMutation(api.createPost, {
    onSuccess: (response) => {
      toast.success('Post created successfully!')
      queryClient.invalidateQueries('posts')
      queryClient.invalidateQueries('account')
      navigate(`/posts/${response.data.post.id}`)
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to create post'
      toast.error(message)
    }
  })

  const onSubmit = (data) => {
    createPostMutation.mutate(data)
  }

  const contentValue = watch('content', '')
  const titleValue = watch('title', '')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600">Share your thoughts with the community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="card">
          <div className="card-body">
            <label htmlFor="title" className="form-label">
              Post Title
            </label>
            <input
              {...register('title')}
              type="text"
              className={`form-input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter a descriptive title for your post"
            />
            {errors.title && (
              <p className="form-error">{errors.title.message}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              {titleValue.length}/200 characters
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card">
          <div className="card-body">
            <label htmlFor="content" className="form-label">
              Post Content
            </label>
            <textarea
              {...register('content')}
              rows={12}
              className={`form-input resize-none ${errors.content ? 'border-red-500' : ''}`}
              placeholder="Write your post content here..."
            />
            {errors.content && (
              <p className="form-error">{errors.content.message}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              {contentValue.length}/5000 characters
            </div>
          </div>
        </div>

        {/* Preview */}
        {(titleValue || contentValue) && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Preview</span>
              </h3>
            </div>
            <div className="card-body">
              {titleValue && (
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {titleValue}
                </h2>
              )}
              {contentValue && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {contentValue}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createPostMutation.isLoading}
            className="btn-primary"
          >
            {createPostMutation.isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePostPage
