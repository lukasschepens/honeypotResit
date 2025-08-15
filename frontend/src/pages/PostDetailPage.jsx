import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  ArrowLeft, 
  User, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Edit,
  Send
} from 'lucide-react'

const commentSchema = yup.object({
  content: yup
    .string()
    .required('Comment is required')
    .min(1, 'Comment must be at least 1 character')
    .max(1000, 'Comment must be less than 1000 characters'),
})

const PostDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [editingComment, setEditingComment] = useState(null)

  const { data: postData, isLoading, error } = useQuery(
    ['post', id],
    () => api.getPost(id)
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(commentSchema)
  })

  const createCommentMutation = useMutation(api.createComment, {
    onSuccess: () => {
      toast.success('Comment added successfully!')
      queryClient.invalidateQueries(['post', id])
      reset()
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to add comment'
      toast.error(message)
    }
  })

  const deletePostMutation = useMutation(api.deletePost, {
    onSuccess: () => {
      toast.success('Post deleted successfully!')
      navigate('/posts')
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to delete post'
      toast.error(message)
    }
  })

  const deleteCommentMutation = useMutation(api.deleteComment, {
    onSuccess: () => {
      toast.success('Comment deleted successfully!')
      queryClient.invalidateQueries(['post', id])
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to delete comment'
      toast.error(message)
    }
  })

  const onSubmitComment = (data) => {
    createCommentMutation.mutate({
      ...data,
      post_id: parseInt(id)
    })
  }

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(id)
    }
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading post. Please try again.</p>
        <button 
          onClick={() => navigate('/posts')}
          className="btn-primary mt-4"
        >
          Back to Posts
        </button>
      </div>
    )
  }

  const post = postData?.data.post

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Post not found.</p>
        <button 
          onClick={() => navigate('/posts')}
          className="btn-primary mt-4"
        >
          Back to Posts
        </button>
      </div>
    )
  }

  const canDeletePost = user?.id === post.user_id || user?.role === 'admin'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/posts')}
        className="btn-secondary flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Posts</span>
      </button>

      {/* Post */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {post.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </div>
            
            {canDeletePost && (
              <div className="flex space-x-2">
                <button
                  onClick={handleDeletePost}
                  className="btn-danger flex items-center space-x-1"
                  disabled={deletePostMutation.isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="card-body">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Add a Comment</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmitComment)} className="space-y-4">
            <div>
              <textarea
                {...register('content')}
                rows={4}
                className={`form-input resize-none ${errors.content ? 'border-red-500' : ''}`}
                placeholder="Write your comment here..."
              />
              {errors.content && (
                <p className="form-error">{errors.content.message}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createCommentMutation.isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>
                  {createCommentMutation.isLoading ? 'Adding...' : 'Add Comment'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Comments */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({post.comments?.length || 0})
          </h3>
        </div>
        <div className="card-body">
          {post.comments?.length > 0 ? (
            <div className="space-y-6">
              {post.comments.map((comment) => {
                const canDeleteComment = user?.id === comment.user_id || user?.role === 'admin'
                
                return (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span>•</span>
                        <Clock className="h-4 w-4" />
                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {canDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          disabled={deleteCommentMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetailPage
