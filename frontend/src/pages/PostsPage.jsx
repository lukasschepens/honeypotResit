import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import * as api from '../services/api'
import { FileText, MessageSquare, User, Clock, Search, PlusCircle } from 'lucide-react'

const PostsPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10

  const { data, isLoading, error } = useQuery(
    ['posts', page, search],
    () => api.getPosts({ page, limit, search }),
    { keepPreviousData: true }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
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
        <p className="text-red-600">Error loading posts. Please try again.</p>
      </div>
    )
  }

  const posts = data?.data.posts || []
  const pagination = data?.data.pagination || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
          <p className="text-gray-600">
            Browse and discover posts from the community
          </p>
        </div>
        <Link to="/create-post" className="btn-primary flex items-center space-x-2">
          <PlusCircle className="h-4 w-4" />
          <span>Create Post</span>
        </Link>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/posts/${post.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                    
                    <p className="text-gray-600 mt-2 line-clamp-3">
                      {post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...`
                        : post.content
                      }
                    </p>

                    <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comment_count} comments</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4">
                    <FileText className="h-12 w-12 text-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              {search ? 'Try adjusting your search terms.' : 'Be the first to create a post!'}
            </p>
            <Link to="/create-post" className="btn-primary">
              Create Post
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="text-center text-sm text-gray-500">
        Showing {posts.length} of {pagination.total} posts
      </div>
    </div>
  )
}

export default PostsPage
