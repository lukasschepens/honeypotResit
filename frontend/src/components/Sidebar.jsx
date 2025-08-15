import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  Upload, 
  User, 
  MessageCircle,
  PlusCircle,
  Shield
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/posts', icon: FileText, label: 'Posts' },
    { to: '/create-post', icon: PlusCircle, label: 'Create Post' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/account', icon: User, label: 'Account' },
    { to: '/honeypot', icon: Shield, label: 'Security Demo' },
  ]

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
