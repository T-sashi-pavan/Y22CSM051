#!/bin/bash
# Quick Feature Test Script
# Run this script to test all major features

echo "🚀 URL Shortener Feature Testing Script"
echo "========================================"

BASE_URL="http://localhost:8080"
API_URL="$BASE_URL/api"

echo ""
echo "1️⃣ Testing Health Check..."
response=$(curl -s "$BASE_URL/health")
if [[ $response == *"OK"* ]]; then
    echo "✅ Health Check: PASSED"
else
    echo "❌ Health Check: FAILED"
    echo "Response: $response"
fi

echo ""
echo "2️⃣ Testing URL Creation (Auto-generated shortcode)..."
response=$(curl -s -X POST "$API_URL/shorturls" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.example.com", "validity": 30}')

if [[ $response == *"shortLink"* ]]; then
    echo "✅ Auto-generated Shortcode: PASSED"
    shortcode=$(echo $response | grep -o '"shortLink":"[^"]*' | cut -d'/' -f4 | cut -d'"' -f1)
    echo "   Generated shortcode: $shortcode"
else
    echo "❌ Auto-generated Shortcode: FAILED"
    echo "Response: $response"
fi

echo ""
echo "3️⃣ Testing URL Creation (Custom shortcode)..."
response=$(curl -s -X POST "$API_URL/shorturls" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.google.com", "validity": 60, "shortcode": "testgoogle"}')

if [[ $response == *"testgoogle"* ]]; then
    echo "✅ Custom Shortcode: PASSED"
else
    echo "❌ Custom Shortcode: FAILED"
    echo "Response: $response"
fi

echo ""
echo "4️⃣ Testing Invalid URL Handling..."
response=$(curl -s -X POST "$API_URL/shorturls" \
    -H "Content-Type: application/json" \
    -d '{"url": "invalid-url"}')

if [[ $response == *"Invalid URL"* || $response == *"400"* ]]; then
    echo "✅ Invalid URL Handling: PASSED"
else
    echo "❌ Invalid URL Handling: FAILED"
    echo "Response: $response"
fi

echo ""
echo "5️⃣ Testing Duplicate Shortcode Handling..."
response=$(curl -s -X POST "$API_URL/shorturls" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://www.github.com", "shortcode": "testgoogle"}')

if [[ $response == *"already exists"* || $response == *"409"* ]]; then
    echo "✅ Duplicate Shortcode Handling: PASSED"
else
    echo "❌ Duplicate Shortcode Handling: FAILED"  
    echo "Response: $response"
fi

echo ""
echo "6️⃣ Testing URL Redirection..."
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/testgoogle")

if [[ $status_code == "301" ]]; then
    echo "✅ URL Redirection: PASSED"
else
    echo "❌ URL Redirection: FAILED"
    echo "Status code: $status_code"
fi

echo ""
echo "7️⃣ Testing Statistics Retrieval..."
response=$(curl -s "$API_URL/shorturls/testgoogle")

if [[ $response == *"clickCount"* && $response == *"originalUrl"* ]]; then
    echo "✅ Statistics Retrieval: PASSED"
    click_count=$(echo $response | grep -o '"clickCount":[0-9]*' | cut -d':' -f2)
    echo "   Click count: $click_count"
else
    echo "❌ Statistics Retrieval: FAILED"
    echo "Response: $response"
fi

echo ""
echo "8️⃣ Testing Get All URLs..."
response=$(curl -s "$API_URL/shorturls")

if [[ $response == *"["* && $response == *"shortcode"* ]]; then
    echo "✅ Get All URLs: PASSED"
    url_count=$(echo $response | grep -o '"shortcode"' | wc -l)
    echo "   Total URLs: $url_count"
else
    echo "❌ Get All URLs: FAILED"
    echo "Response: $response"
fi

echo ""
echo "🏁 Feature Testing Complete!"
echo "========================================"
echo "💡 Next steps:"
echo "1. Check frontend at http://localhost:3000"
echo "2. Test bulk URL creation (up to 5 URLs)"
echo "3. View statistics dashboard"
echo "4. Test copy-to-clipboard functionality"
echo "5. Verify logging in backend console"
