const express = require('express');
const router = express.Router();

// Import individual tool controllers
const jobTitleOptimizationController = require('./job-title-optimization/controller');
const jobDescriptionBuilderController = require('./job-description-builder/controller');
const globalJobSearchController = require('./global-job-search/controller');
const jobMatchingEngineController = require('./job-matching-engine/controller');
const chatAssistantController = require('./chat-assistant/controller');
const personalizedMessageGeneratorController = require('./personalized-message-generator/controller');
const recruitmentAutomationController = require('./recruitment-automation/controller');
const resumeScreeningController = require('./resume-screening/controller');
const interviewSimulatorController = require('./interview-simulator/controller');
const employeeTrainingAssistantController = require('./employee-training-assistant/controller');
const oneOnOneOptimizerController = require('./one-on-one-optimizer/controller');
const sentimentAnalysisController = require('./sentiment-analysis/controller');
const biasDetectorController = require('./bias-detector/controller');
const performanceReviewAssistantController = require('./performance-review-assistant/controller');

// Job Title Optimization routes
router.post('/job-title-optimization/input', jobTitleOptimizationController.submitInput);
router.get('/job-title-optimization/output/:requestId', jobTitleOptimizationController.getOutput);

// Job Description Builder routes
router.post('/job-description-builder/input', jobDescriptionBuilderController.submitInput);
router.get('/job-description-builder/output/:requestId', jobDescriptionBuilderController.getOutput);

// Global Job Search routes
router.post('/global-job-search/input', globalJobSearchController.submitInput);
router.get('/global-job-search/output/:requestId', globalJobSearchController.getOutput);

// Job Matching Engine routes
router.post('/job-matching-engine/input', jobMatchingEngineController.submitInput);
router.get('/job-matching-engine/output/:requestId', jobMatchingEngineController.getOutput);

// Chat Assistant routes
router.post('/chat-assistant/input', chatAssistantController.submitInput);
router.get('/chat-assistant/output/:requestId', chatAssistantController.getOutput);

// Personalized Message Generator routes
router.post('/personalized-message-generator/input', personalizedMessageGeneratorController.submitInput);
router.get('/personalized-message-generator/output/:requestId', personalizedMessageGeneratorController.getOutput);

// Recruitment Automation routes
router.post('/recruitment-automation/input', recruitmentAutomationController.submitInput);
router.get('/recruitment-automation/output/:requestId', recruitmentAutomationController.getOutput);

// Resume Screening routes
router.post('/resume-screening/input', resumeScreeningController.submitInput);
router.get('/resume-screening/output/:requestId', resumeScreeningController.getOutput);

// Interview Simulator routes
router.post('/interview-simulator/input', interviewSimulatorController.submitInput);
router.get('/interview-simulator/output/:requestId', interviewSimulatorController.getOutput);

// Employee Training Assistant routes
router.post('/employee-training-assistant/input', employeeTrainingAssistantController.submitInput);
router.get('/employee-training-assistant/output/:requestId', employeeTrainingAssistantController.getOutput);

// One-on-One Optimizer routes
router.post('/one-on-one-optimizer/input', oneOnOneOptimizerController.submitInput);
router.get('/one-on-one-optimizer/output/:requestId', oneOnOneOptimizerController.getOutput);

// Sentiment Analysis routes
router.post('/sentiment-analysis/input', sentimentAnalysisController.submitInput);
router.get('/sentiment-analysis/output/:requestId', sentimentAnalysisController.getOutput);

// Bias Detector routes
router.post('/bias-detector/input', biasDetectorController.submitInput);
router.get('/bias-detector/output/:requestId', biasDetectorController.getOutput);

// Performance Review Assistant routes
router.post('/performance-review-assistant/input', performanceReviewAssistantController.submitInput);
router.get('/performance-review-assistant/output/:requestId', performanceReviewAssistantController.getOutput);

module.exports = router;

