import React, { useState } from 'react'
import { useQuery } from 'react-query'
import * as api from '../services/api'
import { 
  Shield, 
  AlertTriangle, 
  Database, 
  Settings, 
  Users, 
  FileText,
  Server,
  Lock,
  Eye,
  EyeOff,
  Terminal,
  Bug
} from 'lucide-react'

const HoneypotPage = () => {
  const [showHoneypot, setShowHoneypot] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState('')
  const [honeypotResponse, setHoneypotResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const honeypotEndpoints = [
    { 
      path: '/api/honeypot', 
      name: 'Main Admin Panel', 
      description: 'Fake administrative interface',
      icon: Shield
    },
    { 
      path: '/api/honeypot/admin', 
      name: 'Admin Dashboard', 
      description: 'Administrative control panel',
      icon: Settings
    },
    { 
      path: '/api/honeypot/config', 
      name: 'System Configuration', 
      description: 'System configuration settings',
      icon: Settings
    },
    { 
      path: '/api/honeypot/database', 
      name: 'Database Management', 
      description: 'Database administration tools',
      icon: Database
    },
    { 
      path: '/api/honeypot/users', 
      name: 'User Management', 
      description: 'User account management',
      icon: Users
    },
    { 
      path: '/api/honeypot/files', 
      name: 'File Management', 
      description: 'File system administration',
      icon: FileText
    },
    { 
      path: '/api/honeypot/backup', 
      name: 'Backup System', 
      description: 'System backup management',
      icon: Server
    },
    { 
      path: '/api/honeypot/logs', 
      name: 'System Logs', 
      description: 'System log viewer',
      icon: Terminal
    }
  ]

  const testHoneypotEndpoint = async (endpoint) => {
    setLoading(true)
    setSelectedEndpoint(endpoint)
    
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setHoneypotResponse({
        status: response.status,
        data: data
      })
    } catch (error) {
      setHoneypotResponse({
        status: 'Error',
        data: { error: error.message }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary-600" />
          <span>Security Demonstration</span>
        </h1>
        <p className="text-gray-600">
          Explore the honeypot system designed to detect and log malicious activities
        </p>
      </div>

      {/* Warning */}
      <div className="card border-yellow-200 bg-yellow-50">
        <div className="card-body">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Educational Purpose</h3>
              <p className="text-yellow-700 mt-1">
                This honeypot system is designed for educational and security demonstration purposes. 
                All interactions are logged and monitored. Do not attempt to exploit these endpoints 
                in a production environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Honeypots */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Bug className="h-5 w-5" />
            <span>What is a Honeypot?</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              A honeypot is a cybersecurity mechanism that creates a decoy system to attract and detect malicious activities. 
              It appears to be a legitimate part of the network but is actually isolated and monitored.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Early threat detection</li>
                  <li>Attacker behavior analysis</li>
                  <li>Distraction from real systems</li>
                  <li>Intelligence gathering</li>
                  <li>Improved security awareness</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Our Implementation:</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Fake administrative interfaces</li>
                  <li>Realistic error messages</li>
                  <li>Comprehensive logging</li>
                  <li>Behavioral analysis</li>
                  <li>Real-time monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Honeypot Controls */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Honeypot Endpoints</h3>
            <button
              onClick={() => setShowHoneypot(!showHoneypot)}
              className="btn-secondary flex items-center space-x-2"
            >
              {showHoneypot ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showHoneypot ? 'Hide' : 'Show'} Honeypot</span>
            </button>
          </div>
        </div>
        
        {showHoneypot && (
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {honeypotEndpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => testHoneypotEndpoint(endpoint.path)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <endpoint.icon className="h-6 w-6 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                  <p className="text-xs font-mono text-gray-500">{endpoint.path}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Additional Attack Vectors</h4>
              <p className="text-sm text-gray-600 mb-3">
                These endpoints also respond to common attack patterns:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>POST Requests:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>/api/honeypot/admin/login</li>
                    <li>/api/honeypot/admin/reset</li>
                    <li>/api/honeypot/database/query</li>
                    <li>/api/honeypot/files/download</li>
                  </ul>
                </div>
                <div>
                  <strong>Logged Information:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>IP Address & User Agent</li>
                    <li>Request headers & payload</li>
                    <li>Timestamp & endpoint</li>
                    <li>Attack patterns & frequency</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Display */}
      {honeypotResponse && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">
              Response from {selectedEndpoint}
            </h3>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                honeypotResponse.status === 200 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                Status: {honeypotResponse.status}
              </span>
            </div>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
              <pre className="text-sm">
                {JSON.stringify(honeypotResponse.data, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Security Note</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                This request has been logged to our security monitoring system. In a real attack scenario, 
                this would trigger alerts and begin tracking the attacker's behavior.
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="card-body text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Sending request to honeypot...</p>
          </div>
        </div>
      )}

      {/* Security Features */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Security Features Implemented</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Authentication & Authorization</span>
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>JWT-based authentication</li>
                <li>Role-based access control</li>
                <li>Session management</li>
                <li>Password hashing (bcrypt)</li>
                <li>Input validation & sanitization</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Protection Mechanisms</span>
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>Rate limiting</li>
                <li>CORS protection</li>
                <li>Helmet security headers</li>
                <li>File upload restrictions</li>
                <li>SQL injection prevention</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Monitoring & Logging</span>
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>Comprehensive request logging</li>
                <li>Real-time threat detection</li>
                <li>Attack pattern analysis</li>
                <li>Automated alerting</li>
                <li>Forensic data collection</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <span>Honeypot Features</span>
              </h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                <li>Realistic fake interfaces</li>
                <li>Believable error messages</li>
                <li>Delayed responses</li>
                <li>Behavioral tracking</li>
                <li>Threat intelligence gathering</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HoneypotPage
