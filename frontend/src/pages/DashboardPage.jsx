import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../services/api'
import { 
  FileText, 
  MessageSquare, 
  Upload, 
  Users,
  TrendingUp,
  Clock,
  PlusCircle
} from 'lucide-react'

const DashboardPage = () => {
  const { user } = useAuth()

  const { data: accountData } = useQuery('account', api.getAccount)
  const { data: postsData } = useQuery('recent-posts', () => api.getPosts({ limit: 5 }))
  const { data: uploadsData } = useQuery('upload-stats', api.getUploadStats)

  const stats = [
    {
      title: 'Your Posts',
      value: accountData?.data.user.stats.post_count || 0,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Your Comments',
      value: accountData?.data.user.stats.comment_count || 0,
      icon: MessageSquare,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Files Uploaded',
      value: accountData?.data.user.stats.uploaded_files || 0,
      icon: Upload,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Storage Used',
      value: `${uploadsData?.data.stats.total_size_mb || 0} MB`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '+5%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/create-post" className="btn-primary flex items-center space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">{stat.change}</span>
                <span className="text-gray-600 ml-2">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
              <Link to="/posts" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {postsData?.data.posts.length > 0 ? (
              <div className="space-y-4">
                {postsData.data.posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/posts/${post.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {post.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        by {post.author} • {post.comment_count} comments
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No posts yet. Create your first post!</p>
                <Link to="/create-post" className="btn-primary mt-3 inline-flex">
                  Create Post
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/create-post"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PlusCircle className="h-8 w-8 text-primary-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Create Post</span>
              </Link>
              
              <Link 
                to="/upload"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Upload Files</span>
              </Link>
              
              <Link 
                to="/account"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Account</span>
              </Link>
              
              <Link 
                to="/posts"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Browse Posts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Account Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          {accountData?.data.recent_activity ? (
            <div className="space-y-4">
              {/* Recent Comments */}
              {accountData.data.recent_activity.comments.slice(0, 3).map((comment) => (
                <div key={`comment-${comment.id}`} className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">
                      You commented on <span className="font-medium">{comment.post_title}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Recent Posts */}
              {accountData.data.recent_activity.posts.slice(0, 2).map((post) => (
                <div key={`post-${post.id}`} className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">
                      You created <span className="font-medium">{post.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
