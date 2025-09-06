# URL Shortener Microservice

**Student:** Y22CSM051 - Tirumalasetty Sashi Pavan  
**Course:** Campus Hiring Evaluation Project

A microservice for URL shortening with analytics dashboard. Built with Node.js backend and React frontend.

## Project Overview

This application provides URL shortening functionality with the following capabilities:
- Create shortened URLs with optional custom codes
- Set expiration times for URLs (default 30 minutes)
- Track click analytics with location and referrer data
- View comprehensive statistics dashboard
- Support for bulk URL creation (up to 5 URLs)

## Tech Stack

**Backend:**
- Node.js with TypeScript
- Express.js framework
- Custom logging middleware (as required)
- In-memory data storage

**Frontend:**
- React 18 with TypeScript
- Material-UI components
- Axios for API communication
- Custom validation utilities

## Setup Instructions

### Backend Setup
```bash
cd BackendTask
npm install
npm run build
npm start
```
Server runs on: `http://localhost:8080`

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
Application runs on: `http://localhost:3000`

## API Endpoints

### Create Short URL
`POST /api/shorturls`
```json
{
  "url": "https://example.com",
  "validity": 30,
  "shortcode": "custom123"
}
```

### Get Statistics
`GET /api/shorturls/{shortcode}`

### Redirect
`GET /{shortcode}` - Redirects to original URL

### Health Check
`GET /health`

## Features Implemented

- Custom logging middleware throughout the application
- URL validation and error handling
- Click tracking with geolocation
- Responsive Material-UI interface
- Client-side form validation
- Rate limiting and security headers
- Comprehensive analytics dashboard

## Testing

Run the test suite:
```bash
npx ts-node src/test/api-test.ts
```

## Project Structure

```
src/
├── index.ts              # Main server
├── middleware/logging.ts # Custom logging
├── routes/               # API endpoints
├── services/             # Business logic
└── types/                # TypeScript interfaces

frontend/src/
├── components/           # React components
├── services/             # API client
└── utils/                # Validation & logging
```

This project fulfills all requirements for the campus hiring evaluation, including mandatory logging middleware integration and comprehensive URL shortening functionality.
