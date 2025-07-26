# Zero Code AI Tools

A comprehensive suite of AI-powered tools for HR and recruitment processes, built with Node.js backend and a simple frontend test interface.

## Overview

This project provides 14 different AI tools designed to streamline HR and recruitment workflows:

1. **Job Title Optimization** - Optimize job titles for better SEO and candidate attraction
2. **Job Description Builder** - Create comprehensive and engaging job descriptions
3. **Global Job Search Assistant** - Search for job opportunities across various platforms
4. **Job Matching Engine** - Match resumes with job descriptions and provide compatibility scores
5. **AI Chat Assistant** - Conversational AI support for HR-related queries
6. **Personalized Message Generator** - Create personalized recruitment messages
7. **Recruitment Automation** - Automate candidate search and screening processes
8. **Resume Screening & Analysis** - Analyze and screen resumes automatically
9. **Interview Simulator** - Generate interview questions for practice and preparation
10. **New Employee Training Assistant** - Create onboarding and training materials
11. **One-on-One Meeting Optimizer** - Optimize meeting agendas and discussions
12. **Sentiment Analysis** - Analyze sentiment in feedback and communications
13. **Bias Detector in Recruitment** - Detect potential bias in recruitment materials
14. **Performance Review Assistant** - Assist in writing comprehensive performance reviews

## Architecture

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with raw SQL queries
- **AI Integration**: MetisAI API for natural language processing
- **Validation**: Joi for request validation
- **CORS**: Enabled for cross-origin requests

### Frontend
- **Technology**: Vanilla HTML, CSS, and JavaScript
- **Purpose**: Test interface for API endpoints
- **Features**: Interactive forms for each AI tool with real-time results

## Project Structure

```
zero-code-aitools/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── database.js          # PostgreSQL connection and utilities
│   │   │   ├── metis-ai.js          # MetisAI API integration
│   │   │   └── validation.js        # Request validation schemas
│   │   ├── modules/
│   │   │   └── ai-tools/
│   │   │       ├── routes.js        # Main API routes
│   │   │       ├── job-title-optimization/
│   │   │       ├── job-description-builder/
│   │   │       ├── global-job-search/
│   │   │       ├── job-matching-engine/
│   │   │       ├── chat-assistant/
│   │   │       ├── personalized-message-generator/
│   │   │       ├── recruitment-automation/
│   │   │       ├── resume-screening/
│   │   │       ├── interview-simulator/
│   │   │       ├── employee-training-assistant/
│   │   │       ├── one-on-one-optimizer/
│   │   │       ├── sentiment-analysis/
│   │   │       ├── bias-detector/
│   │   │       └── performance-review-assistant/
│   │   ├── database/
│   │   │   ├── migration.sql        # Database schema
│   │   │   └── migrate.js           # Migration runner
│   │   └── main.js                  # Express server entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── public/
│   │   └── index.html               # Test interface
│   ├── package.json
│   └── README.md
└── README.md                        # This file
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- MetisAI API key

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=zero_code_aitools
   
   # MetisAI Configuration
   METIS_API_KEY=your_metis_api_key
   METIS_BASE_URL=https://api.metis.ai
   ```

4. **Setup database**:
   ```bash
   # Create database
   createdb zero_code_aitools
   
   # Run migrations
   node src/database/migrate.js
   ```

5. **Start the server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Start the test interface**:
   ```bash
   npm start
   ```

3. **Open in browser**:
   ```
   http://localhost:8080
   ```

## API Usage

Each AI tool follows the same pattern:

### Submit Input
```bash
POST /api/ai-tools/{tool-name}/input
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

**Response**:
```json
{
  "requestId": "uuid-string"
}
```

### Get Results
```bash
GET /api/ai-tools/{tool-name}/output/{requestId}
```

**Response** (when ready):
```json
{
  "requestId": "uuid-string",
  "result": "processed-output",
  "processedAt": "2024-01-01T12:00:00Z"
}
```

## Available Tools

### Job Title Optimization
- **Endpoint**: `job-title-optimization`
- **Input**: Current job title, industry, experience level, location type, keywords
- **Output**: Array of optimized job titles

### Job Description Builder
- **Endpoint**: `job-description-builder`
- **Input**: Job details, company info, requirements, benefits
- **Output**: Complete job description text

### Chat Assistant
- **Endpoint**: `chat-assistant`
- **Input**: Message and optional conversation history
- **Output**: AI assistant response

### Sentiment Analysis
- **Endpoint**: `sentiment-analysis`
- **Input**: Text to analyze
- **Output**: Overall sentiment and key phrases

*[Additional tools follow similar patterns]*

## Database Schema

The database contains input and output tables for each AI tool:
- Input tables store user requests and parameters
- Output tables store AI-generated results
- All tables use UUID primary keys
- Foreign key relationships link inputs to outputs

## Development

### Adding New Tools

1. Create controller in `backend/src/modules/ai-tools/{tool-name}/controller.js`
2. Add validation schema in `backend/src/common/validation.js`
3. Add routes in `backend/src/modules/ai-tools/routes.js`
4. Create database tables in migration script
5. Add frontend form in test interface

### Testing

- Use the frontend test interface for manual testing
- Backend includes health check endpoint: `GET /health`
- All AI processing is asynchronous with polling-based result retrieval

## Deployment

### Backend
- Server listens on `0.0.0.0` for external access
- CORS enabled for frontend integration
- Environment variables for configuration

### Frontend
- Static files can be served by any web server
- Configure API_BASE_URL for different environments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the test interface
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the README files in backend and frontend directories
2. Review the API documentation
3. Test with the provided frontend interface
4. Check database migration and setup

