# Zero Code AI Tools Backend

This is the backend service for Zero Code AI Tools, providing REST API endpoints for various AI-powered HR and recruitment tools.

## Features

The backend provides 14 different AI tools:

1. **Job Title Optimization** - Optimizes job titles for better SEO and candidate attraction
2. **Job Description Builder** - Creates comprehensive job descriptions
3. **Global Job Search Assistant** - Searches for job opportunities across platforms
4. **Job Matching Engine** - Matches resumes with job descriptions
5. **AI Chat Assistant** - Provides conversational AI support for HR queries
6. **Personalized Message Generator** - Creates personalized messages for recruitment
7. **Recruitment Automation** - Automates candidate search and screening
8. **Resume Screening & Analysis** - Analyzes and screens resumes
9. **Interview Simulator** - Generates interview questions for practice
10. **New Employee Training Assistant** - Creates onboarding training materials
11. **One-on-One Meeting Optimizer** - Optimizes meeting agendas
12. **Sentiment Analysis** - Analyzes sentiment in feedback and communications
13. **Bias Detector in Recruitment** - Detects potential bias in recruitment materials
14. **Performance Review Assistant** - Assists in writing performance reviews

## Architecture

- **Framework**: Node.js with Express
- **Database**: PostgreSQL with raw SQL queries
- **AI Integration**: MetisAI API
- **Validation**: Joi for request validation
- **CORS**: Enabled for cross-origin requests

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Update the following variables:
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - PostgreSQL connection
   - `METIS_API_KEY`, `METIS_BASE_URL` - MetisAI API configuration

3. **Database Setup**:
   Run the migration to create all necessary tables:
   ```bash
   node src/database/migrate.js
   ```

4. **Start the Server**:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

Each AI tool has two main endpoints:

### Input Endpoints (POST)
- `/api/ai-tools/{tool-name}/input` - Submit input for processing

### Output Endpoints (GET)
- `/api/ai-tools/{tool-name}/output/{requestId}` - Retrieve processed results

### Available Tools:
- `job-title-optimization`
- `job-description-builder`
- `global-job-search`
- `job-matching-engine`
- `chat-assistant`
- `personalized-message-generator`
- `recruitment-automation`
- `resume-screening`
- `interview-simulator`
- `employee-training-assistant`
- `one-on-one-optimizer`
- `sentiment-analysis`
- `bias-detector`
- `performance-review-assistant`

### Health Check
- `GET /health` - Server health status

## Usage Example

1. **Submit Input**:
   ```bash
   curl -X POST http://localhost:3000/api/ai-tools/job-title-optimization/input \
     -H "Content-Type: application/json" \
     -d '{
       "currentJobTitle": "Software Engineer",
       "industry": "Technology",
       "experienceLevel": "Mid-level",
       "locationType": "Remote",
       "keywords": "backend, API, cloud"
     }'
   ```

2. **Get Results**:
   ```bash
   curl http://localhost:3000/api/ai-tools/job-title-optimization/output/{requestId}
   ```

## Database Schema

The database contains input and output tables for each AI tool:
- Input tables store user requests and parameters
- Output tables store AI-generated results
- All tables use UUID as primary keys
- Foreign key relationships link inputs to outputs

## Error Handling

- Input validation using Joi schemas
- Graceful error handling with appropriate HTTP status codes
- MetisAI API error handling and fallbacks
- Database error handling and transaction support

## Development

- Use `npm run dev` for development with nodemon
- All AI processing happens asynchronously in the background
- Results are stored in the database and retrieved via the output endpoints
- CORS is enabled for frontend integration

## Deployment

The server listens on `0.0.0.0` to allow external access and supports CORS for frontend integration.

