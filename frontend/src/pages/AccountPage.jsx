import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import * as api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  FileText,
  MessageSquare,
  Upload,
  Settings,
  Trash2
} from 'lucide-react'

const accountSchema = yup.object({
  email: yup
    .string()
    .email('Please provide a valid email address'),
  currentPassword: yup
    .string()
    .when('newPassword', {
      is: (val) => val && val.length > 0,
      then: (schema) => schema.required('Current password is required when changing password'),
      otherwise: (schema) => schema
    }),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters'),
})

const AccountPage = () => {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: accountData } = useQuery('account', api.getAccount)
  const { data: postsData } = useQuery('account-posts', () => api.getAccountPosts({ limit: 5 }))
  const { data: commentsData } = useQuery('account-comments', () => api.getAccountComments({ limit: 5 }))
  const { data: filesData } = useQuery('account-files', () => api.getAccountFiles({ limit: 5 }))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(accountSchema),
    defaultValues: {
      email: user?.email || ''
    }
  })

  const updateAccountMutation = useMutation(api.editAccount, {
    onSuccess: () => {
      toast.success('Account updated successfully!')
      queryClient.invalidateQueries('account')
      queryClient.invalidateQueries('auth')
      reset()
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to update account'
      toast.error(message)
    }
  })

  const deleteAccountMutation = useMutation(api.deleteAccount, {
    onSuccess: () => {
      toast.success('Account deleted successfully!')
      logout()
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to delete account'
      toast.error(message)
    }
  })

  const onSubmit = (data) => {
    // Only send fields that have values
    const updateData = {}
    if (data.email && data.email !== user?.email) {
      updateData.email = data.email
    }
    if (data.newPassword) {
      updateData.currentPassword = data.currentPassword
      updateData.newPassword = data.newPassword
    }

    if (Object.keys(updateData).length > 0) {
      updateAccountMutation.mutate(updateData)
    } else {
      toast.error('No changes to save')
    }
  }

  const handleDeleteAccount = (passwordData) => {
    deleteAccountMutation.mutate(passwordData)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity', label: 'Activity', icon: FileText },
  ]

  const stats = accountData?.data.user.stats || {}

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600">Manage your account settings and view your activity</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.username}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-4 flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{user?.role}</span>
                </div>
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Joined {new Date(accountData?.data.user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <div className="card-body text-center">
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.post_count || 0}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.comment_count || 0}</p>
                  <p className="text-sm text-gray-600">Comments</p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <Upload className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.uploaded_files || 0}</p>
                  <p className="text-sm text-gray-600">Files</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {postsData?.data.posts.slice(0, 3).map((post) => (
                    <div key={`post-${post.id}`} className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {commentsData?.data.comments.slice(0, 2).map((comment) => (
                    <div key={`comment-${comment.id}`} className="flex items-center space-x-3">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Commented on "{comment.post_title}"
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          {/* Account Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={user?.username}
                    disabled
                    className="form-input bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Current Password</label>
                  <input
                    {...register('currentPassword')}
                    type="password"
                    className={`form-input ${errors.currentPassword ? 'border-red-500' : ''}`}
                    placeholder="Enter current password (only if changing password)"
                  />
                  {errors.currentPassword && (
                    <p className="form-error">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">New Password</label>
                  <input
                    {...register('newPassword')}
                    type="password"
                    className={`form-input ${errors.newPassword ? 'border-red-500' : ''}`}
                    placeholder="Enter new password (leave blank to keep current)"
                  />
                  {errors.newPassword && (
                    <p className="form-error">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateAccountMutation.isLoading}
                    className="btn-primary"
                  >
                    {updateAccountMutation.isLoading ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200">
            <div className="card-header border-red-200">
              <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const password = e.target.password.value
                    if (password) {
                      handleDeleteAccount({ password })
                    }
                  }}>
                    <input
                      name="password"
                      type="password"
                      placeholder="Enter your password to confirm"
                      className="form-input mb-3"
                      required
                    />
                    
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={deleteAccountMutation.isLoading}
                        className="btn-danger"
                      >
                        {deleteAccountMutation.isLoading ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Your Posts</h3>
            </div>
            <div className="card-body">
              {postsData?.data.posts.length > 0 ? (
                <div className="space-y-4">
                  {postsData.data.posts.map((post) => (
                    <div key={post.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <h4 className="font-medium text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {post.comment_count} comments • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No posts yet</p>
              )}
            </div>
          </div>

          {/* Recent Comments */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Your Comments</h3>
            </div>
            <div className="card-body">
              {commentsData?.data.comments.length > 0 ? (
                <div className="space-y-4">
                  {commentsData.data.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <p className="text-sm text-gray-900">
                        On "<span className="font-medium">{comment.post_title}</span>"
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountPage
