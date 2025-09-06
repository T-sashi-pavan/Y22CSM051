# URL Shortener Microservice - Y22CSM051

**Student ID:** Y22CSM051  
**Name:** Tirumalasetty Sashi Pavan  
**GitHub:** [@T-sashi-pavan](https://github.com/T-sashi-pavan)

A full-stack URL shortener application with comprehensive analytics, built with Node.js/TypeScript backend and React frontend using mandatory logging middleware.

## 🚀 Features

### Backend Microservice
- **URL Shortening**: Create short URLs with optional custom shortcodes
- **Custom Validity**: Set expiration time for URLs (default: 30 minutes)
- **Analytics**: Track clicks with geolocation, referrer, and timestamp data
- **Logging Middleware**: Comprehensive logging system for all operations
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Proper HTTP status codes and error messages
- **Health Checks**: Monitor service status

### Frontend Web Application
- **Responsive Design**: Material-UI components for modern interface
- **Bulk URL Shortening**: Create up to 5 URLs simultaneously
- **Real-time Validation**: Client-side validation for all inputs
- **Analytics Dashboard**: View detailed statistics for all shortened URLs
- **Copy to Clipboard**: Easy sharing of shortened URLs
- **Comprehensive Logging**: Frontend logging middleware

## 📁 Project Structure

```
BackendTask/
├── src/                          # Backend source code
│   ├── index.ts                 # Main server file
│   ├── middleware/
│   │   └── logging.ts           # Logging middleware
│   ├── routes/
│   │   ├── shorturl.ts         # URL shortening routes
│   │   └── redirect.ts         # Redirect routes
│   ├── services/
│   │   └── urlService.ts       # URL business logic
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── test/
│       └── api-test.ts         # API testing script
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UrlShortenerPage.tsx
│   │   │   └── StatisticsPage.tsx
│   │   ├── services/
│   │   │   └── apiService.ts
│   │   ├── utils/
│   │   │   ├── logging.ts
│   │   │   └── validation.ts
│   │   └── types/
│   │       └── index.ts
│   └── public/
├── package.json                 # Backend dependencies
├── tsconfig.json               # TypeScript configuration
└── .env                        # Environment variables
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
1. Navigate to the project root:
   ```bash
   cd BackendTask
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   The backend will be available at `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   
   The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
`http://localhost:8080`

### Endpoints

#### 1. Create Short URL
- **POST** `/api/shorturls`
- **Description**: Creates a new shortened URL
- **Request Body**:
  ```json
  {
    "url": "https://example.com/very-long-url",
    "validity": 30,
    "shortcode": "custom123"
  }
  ```
- **Response** (201):
  ```json
  {
    "shortLink": "http://localhost:8080/custom123",
    "expiry": "2025-09-06T08:30:00.000Z"
  }
  ```

#### 2. Get URL Statistics
- **GET** `/api/shorturls/{shortcode}`
- **Description**: Retrieves detailed analytics for a short URL
- **Response** (200):
  ```json
  {
    "shortcode": "custom123",
    "originalUrl": "https://example.com/very-long-url",
    "createdAt": "2025-09-06T08:00:00.000Z",
    "expiresAt": "2025-09-06T08:30:00.000Z",
    "clickCount": 5,
    "clicks": [
      {
        "timestamp": "2025-09-06T08:15:00.000Z",
        "referrer": "https://google.com",
        "location": {
          "country": "US",
          "region": "CA",
          "city": "San Francisco"
        }
      }
    ]
  }
  ```

#### 3. Get All URLs
- **GET** `/api/shorturls`
- **Description**: Retrieves all shortened URLs with statistics
- **Response** (200): Array of URL objects

#### 4. Redirect to Original URL
- **GET** `/{shortcode}`
- **Description**: Redirects to the original URL and tracks the click
- **Response**: 301 redirect or 404 if not found/expired

#### 5. Health Check
- **GET** `/health`
- **Description**: Check service health
- **Response** (200):
  ```json
  {
    "status": "OK",
    "timestamp": "2025-09-06T08:00:00.000Z",
    "uptime": 3600
  }
  ```

## 🧪 Testing

### Backend API Testing
Run the comprehensive test suite:
```bash
cd BackendTask
npx ts-node src/test/api-test.ts
```

This will test:
- ✅ Health check endpoint
- ✅ URL creation with auto-generated shortcode
- ✅ URL creation with custom shortcode
- ✅ Invalid URL handling
- ✅ Duplicate shortcode handling
- ✅ Redirect functionality
- ✅ Statistics retrieval
- ✅ Bulk URL retrieval

### Manual Testing Scenarios

#### 1. URL Shortening Tests
1. Open `http://localhost:3000`
2. Enter a long URL: `https://very-very-very-long-subdomain.example.com/path/to/resource`
3. Set validity to 60 minutes
4. Set custom shortcode: `test123`
5. Click "Shorten URL"
6. Verify the shortened URL is created and displayed

#### 2. Bulk URL Creation
1. Click "Add Another URL" to create multiple forms
2. Fill in different URLs with various settings
3. Test validation by entering invalid URLs or shortcodes
4. Submit all forms and verify results

#### 3. Analytics Testing
1. Navigate to "Statistics" tab
2. Click on shortened URLs to test redirects
3. Refresh the statistics page to see updated click counts
4. Expand rows to view detailed click information

#### 4. Error Handling Tests
1. Try creating URLs with invalid formats
2. Attempt to use duplicate shortcodes
3. Test expired URL access
4. Verify proper error messages

## 📸 Screenshots to Capture for Documentation

### 1. URL Shortener Page
- Empty form state
- Form with multiple URLs (showing 5 different forms)
- Successful URL creation with results
- Validation errors display
- Copy to clipboard functionality

### 2. Statistics Page
- Overview of all shortened URLs
- Expanded view showing click details
- Empty state (no URLs created)
- Click analytics with location data

### 3. API Testing
- Terminal showing successful test results
- Backend logs showing request processing
- Health check response in browser/Postman

### 4. Network Traffic
- Browser developer tools showing API calls
- Response payloads for create URL and get statistics

### 5. Error Handling
- Invalid URL submission
- Duplicate shortcode error
- Expired URL access attempt

## 🔧 Configuration

### Environment Variables (.env)
```
PORT=8080
NODE_ENV=development
LOG_LEVEL=info
```

### Frontend Configuration
- **API Base URL**: Configured via proxy in package.json
- **Material-UI Theme**: Customizable in App.tsx
- **Logging Level**: Configurable in logging middleware

## 🏗️ Architecture

### Backend Architecture
- **Express.js**: Web framework
- **TypeScript**: Type safety and modern JavaScript features
- **Singleton Pattern**: For services and logging
- **Middleware Pattern**: For logging and error handling
- **In-Memory Storage**: For demonstration (can be replaced with database)

### Frontend Architecture
- **React 18**: Modern React with hooks
- **Material-UI**: Component library for consistent design
- **TypeScript**: Type safety
- **Axios**: HTTP client
- **Custom Hooks**: For state management and API calls

### Security Features
- **Helmet**: Security headers
- **CORS**: Cross-origin request handling
- **Rate Limiting**: Request throttling
- **Input Validation**: Client and server-side validation
- **Error Sanitization**: Safe error message exposure

## 🚀 Deployment Considerations

### Production Setup
1. Set `NODE_ENV=production`
2. Use a proper database (PostgreSQL, MongoDB)
3. Implement user authentication
4. Set up reverse proxy (nginx)
5. Use PM2 for process management
6. Implement proper logging (Winston + external service)
7. Set up monitoring and alerts

### Scaling Considerations
- Database optimization for URL lookups
- Redis for caching frequently accessed URLs
- Load balancing for multiple instances
- CDN for static assets
- Database sharding for large-scale deployments

## 📝 License
MIT License - feel free to use this project for educational purposes.

## 👥 Contributing
This is an educational project. For production use, consider implementing:
- Database persistence
- User authentication
- Advanced analytics
- Custom domains
- Bulk operations API
- Admin dashboard
