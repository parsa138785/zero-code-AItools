# Zero Code AI Tools - Frontend Test Interface

A simple web interface for testing the Zero Code AI Tools backend API endpoints.

## Overview

This frontend provides an interactive test interface for all 14 AI tools available in the backend. It's built with vanilla HTML, CSS, and JavaScript for simplicity and ease of use.

## Features

- **Interactive Tool Selection**: Click on any tool card to select and configure it
- **Dynamic Forms**: Each tool has its own form with appropriate input fields
- **Real-time Testing**: Submit requests and see results in real-time
- **Responsive Design**: Works on desktop and mobile devices
- **Persian/Farsi Support**: Right-to-left layout with Persian text
- **Error Handling**: Clear error messages and validation feedback

## Available Tools

The interface includes forms for testing these AI tools:

1. **Job Title Optimization** (بهینه‌سازی عنوان شغلی)
2. **Job Description Builder** (سازنده شرح شغل)
3. **Chat Assistant** (دستیار چت هوشمند)
4. **Sentiment Analysis** (تحلیل احساسات)

*Note: Additional tools can be easily added by extending the `tools` array in the JavaScript code.*

## Setup

### Prerequisites
- A running instance of the Zero Code AI Tools backend
- Python 3 (for the simple HTTP server)

### Running the Interface

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Start the HTTP server**:
   ```bash
   npm start
   # or
   python3 -m http.server 8080
   ```

3. **Open in browser**:
   ```
   http://localhost:8080
   ```

### Configuration

The API base URL is configured in the JavaScript code:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/ai-tools';
```

Update this URL if your backend is running on a different host or port.

## Usage

### Testing an AI Tool

1. **Select a Tool**: Click on any tool card in the grid
2. **Fill the Form**: Complete the required fields (marked with *)
3. **Submit Request**: Click "ارسال درخواست" (Submit Request)
4. **View Results**: Results will appear automatically when processing is complete

### Form Fields

Each tool has specific input fields:

#### Job Title Optimization
- Current Job Title (required)
- Industry (required)
- Experience Level (dropdown: Beginner, Intermediate, Advanced, Senior)
- Location Type (dropdown: On-site, Remote, Hybrid)
- Keywords (optional)

#### Job Description Builder
- Job Title (required)
- Company Name (required)
- Location (required)
- Job Type (dropdown: Full-time, Part-time, Project-based, Contract)
- Required Experience in years (required)
- Key Skills (textarea, required)
- Additional Responsibilities (textarea, optional)
- Benefits (textarea, optional)

#### Chat Assistant
- Your Message (textarea, required)

#### Sentiment Analysis
- Text to Analyze (textarea, required)

## How It Works

### Request Flow

1. **Form Submission**: User fills out the form and clicks submit
2. **API Call**: JavaScript sends POST request to `/api/ai-tools/{tool}/input`
3. **Request ID**: Backend returns a unique request ID
4. **Polling**: Frontend polls `/api/ai-tools/{tool}/output/{requestId}` every 2 seconds
5. **Results Display**: When results are ready, they're displayed in the results section

### Error Handling

- **Validation**: Required fields are validated before submission
- **Network Errors**: Connection issues are caught and displayed
- **API Errors**: Backend errors are shown with appropriate messages
- **Loading States**: Visual feedback during processing

## Customization

### Adding New Tools

To add a new AI tool to the interface:

1. **Add Tool Definition**:
   ```javascript
   const newTool = {
       id: 'new-tool-name',
       title: 'Tool Display Name',
       description: 'Tool description',
       fields: [
           { name: 'fieldName', label: 'Field Label', type: 'text', required: true },
           // Add more fields as needed
       ]
   };
   ```

2. **Add to Tools Array**:
   ```javascript
   tools.push(newTool);
   ```

### Field Types

Supported field types:
- `text`: Single-line text input
- `textarea`: Multi-line text input
- `number`: Numeric input
- `select`: Dropdown with predefined options

### Styling

The interface uses CSS Grid and Flexbox for responsive layout. Key classes:

- `.tool-card`: Individual tool cards
- `.tool-card.active`: Selected tool styling
- `.test-form`: Form container
- `.result-section`: Results display area
- `.btn`: Button styling

## Development

### File Structure

```
frontend/
├── public/
│   └── index.html          # Main interface file
├── package.json            # Project configuration
└── README.md              # This file
```

### Extending Functionality

The interface can be extended with:

- **File Upload**: For tools that need document input
- **Multiple Results**: For tools that return multiple outputs
- **History**: To save and review previous requests
- **Export**: To download results in different formats

### Browser Compatibility

The interface uses modern JavaScript features:
- Fetch API for HTTP requests
- Async/await for promise handling
- Template literals for string formatting
- Arrow functions

Supports all modern browsers (Chrome, Firefox, Safari, Edge).

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend has CORS enabled
2. **Connection Refused**: Check that the backend is running on the correct port
3. **404 Errors**: Verify the API_BASE_URL matches your backend configuration
4. **Slow Responses**: Some AI tools may take longer to process

### Debug Mode

Open browser developer tools (F12) to see:
- Network requests and responses
- JavaScript console errors
- API response details

## Production Deployment

For production use:

1. **Build Process**: Consider using a build tool for optimization
2. **CDN**: Serve static files from a CDN for better performance
3. **HTTPS**: Use HTTPS for secure communication
4. **Environment Config**: Make API_BASE_URL configurable

## License

MIT License - same as the main project.

