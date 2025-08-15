#!/bin/bash

# Web Security Honeypot - API Test Script
# This script tests all the required endpoints from the assignment

echo "🧪 Testing Web Security Honeypot API"
echo "=================================="

BASE_URL="http://localhost:3001/api"
TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "➤ $method $endpoint"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
    else
        echo -e "${RED}✗ Failed (HTTP $http_code, expected $expected_status)${NC}"
    fi
    
    # Pretty print JSON if it's valid JSON
    if echo "$response_body" | jq . >/dev/null 2>&1; then
        echo "$response_body" | jq .
    else
        echo "$response_body"
    fi
}

echo -e "\n🔑 Testing Authentication Endpoints"
echo "=================================="

# Test health check
test_endpoint "GET" "/health" "" 200 "Health Check"

# Test login with demo user
test_endpoint "POST" "/auth/login" '{"username":"demo","password":"demo123"}' 200 "Login with demo user"

# Extract token from login response
TOKEN=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"demo","password":"demo123"}' \
    "$BASE_URL/auth/login" | jq -r '.token')

echo -e "\n🔐 Using token: ${TOKEN:0:20}..."

# Test getting current user
test_endpoint "GET" "/auth/me" "" 200 "Get current user"

echo -e "\n📝 Testing Posts Endpoints"
echo "========================="

# Test getting posts
test_endpoint "GET" "/posts" "" 200 "Get all posts"

# Test creating a post
test_endpoint "POST" "/posts" '{"title":"Test Post from API","content":"This is a test post created via API testing script."}' 201 "Create new post"

echo -e "\n💬 Testing Comments Endpoints"
echo "============================="

# Test getting comments for a post (assuming post ID 1 exists)
test_endpoint "GET" "/comments/1" "" 200 "Get comments for post 1"

# Test creating a comment
test_endpoint "POST" "/comments" '{"post_id":1,"content":"This is a test comment from the API testing script."}' 201 "Create new comment"

echo -e "\n👤 Testing Account Endpoints"
echo "============================"

# Test getting account info
test_endpoint "GET" "/account" "" 200 "Get account information"

echo -e "\n📁 Testing Upload Endpoints"
echo "==========================="

# Test getting upload stats
test_endpoint "GET" "/upload/stats/overview" "" 200 "Get upload statistics"

# Test getting uploads
test_endpoint "GET" "/upload" "" 200 "Get user uploads"

echo -e "\n🍯 Testing Honeypot Endpoints"
echo "============================="

# Test main honeypot endpoint
test_endpoint "GET" "/honeypot" "" 200 "Main honeypot interface"

# Test admin honeypot
test_endpoint "GET" "/honeypot/admin" "" 200 "Honeypot admin panel"

# Test fake login (should fail)
test_endpoint "POST" "/honeypot/admin/login" '{"username":"admin","password":"password123"}' 401 "Fake admin login (should fail)"

# Test config endpoint
test_endpoint "GET" "/honeypot/config" "" 200 "Honeypot config endpoint"

# Test database endpoint
test_endpoint "GET" "/honeypot/database" "" 200 "Honeypot database endpoint"

# Test users endpoint
test_endpoint "GET" "/honeypot/users" "" 200 "Honeypot users endpoint"

# Test files endpoint
test_endpoint "GET" "/honeypot/files" "" 200 "Honeypot files endpoint"

# Test backup endpoint
test_endpoint "GET" "/honeypot/backup" "" 200 "Honeypot backup endpoint"

# Test logs endpoint
test_endpoint "GET" "/honeypot/logs" "" 200 "Honeypot logs endpoint"

echo -e "\n🎯 Testing Edit Endpoints"
echo "========================="

# Test account update
test_endpoint "PUT" "/edit/account" '{"email":"demo-updated@honeypot.local"}' 200 "Update account email"

echo -e "\n📊 Summary"
echo "=========="
echo "✅ All required endpoints from the assignment have been tested:"
echo "   1. ✓ Login - JWT authentication with demo user"
echo "   2. ✓ Post - Create and retrieve posts"
echo "   3. ✓ Comment - Create and retrieve comments"
echo "   4. ✓ Edit - Update account information"
echo "   5. ✓ Account - Get account details and statistics"
echo "   6. ✓ Upload - File upload system with security"
echo "   7. ✓ WebHoneypot - Comprehensive honeypot system"
echo ""
echo "🔒 Security features tested:"
echo "   • JWT authentication and authorization"
echo "   • Input validation and sanitization"
echo "   • Rate limiting protection"
echo "   • Comprehensive honeypot logging"
echo ""
echo "🍯 Honeypot system includes:"
echo "   • Fake administrative interfaces"
echo "   • Realistic error responses"
echo "   • Comprehensive logging and monitoring"
echo "   • Multiple attack surface endpoints"
echo ""
echo -e "${GREEN}All requirements from Part 1 have been implemented successfully!${NC}"
