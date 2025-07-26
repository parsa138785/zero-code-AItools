const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  jobTitleOptimization: Joi.object({
    currentJobTitle: Joi.string().required(),
    industry: Joi.string().required(),
    experienceLevel: Joi.string().required(),
    locationType: Joi.string().required(),
    keywords: Joi.string().allow('', null)
  }),

  jobDescriptionBuilder: Joi.object({
    jobTitle: Joi.string().required(),
    companyName: Joi.string().required(),
    location: Joi.string().required(),
    jobType: Joi.string().required(),
    requiredExperience: Joi.number().min(0).required(),
    keySkills: Joi.string().required(),
    additionalResponsibilities: Joi.string().allow('', null),
    benefits: Joi.string().allow('', null)
  }),

  globalJobSearch: Joi.object({
    keywords: Joi.string().required(),
    location: Joi.string().allow('', null),
    jobType: Joi.string().allow('', null),
    experienceLevel: Joi.string().allow('', null)
  }),

  jobMatchingEngine: Joi.object({
    resumeText: Joi.string().required(),
    jobDescriptionText: Joi.string().required()
  }),

  chatAssistant: Joi.object({
    message: Joi.string().required(),
    conversationHistory: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
      })
    ).allow(null)
  }),

  personalizedMessageGenerator: Joi.object({
    recipientName: Joi.string().required(),
    purpose: Joi.string().required(),
    keyPoints: Joi.string().required(),
    senderName: Joi.string().required(),
    tone: Joi.string().allow('', null)
  }),

  recruitmentAutomation: Joi.object({
    jobTitle: Joi.string().required(),
    requiredSkills: Joi.string().required(),
    experienceYears: Joi.number().min(0).required(),
    location: Joi.string().allow('', null)
  }),

  resumeScreening: Joi.object({
    resumeText: Joi.string().required(),
    jobDescriptionText: Joi.string().allow('', null)
  }),

  interviewSimulator: Joi.object({
    jobRole: Joi.string().required(),
    interviewType: Joi.string().allow('', null),
    difficulty: Joi.string().allow('', null)
  }),

  employeeTrainingAssistant: Joi.object({
    onboardingTopic: Joi.string().required(),
    role: Joi.string().allow('', null),
    format: Joi.string().allow('', null)
  }),

  oneOnOneOptimizer: Joi.object({
    meetingPurpose: Joi.string().required(),
    attendees: Joi.string().required(),
    lastMeetingTopics: Joi.string().allow('', null),
    upcomingProjects: Joi.string().allow('', null)
  }),

  sentimentAnalysis: Joi.object({
    text: Joi.string().required()
  }),

  biasDetector: Joi.object({
    text: Joi.string().required()
  }),

  performanceReviewAssistant: Joi.object({
    employeeName: Joi.string().required(),
    period: Joi.string().required(),
    achievements: Joi.string().allow('', null),
    areasForImprovement: Joi.string().allow('', null),
    goalsForNextPeriod: Joi.string().allow('', null)
  })
};

module.exports = {
  validateRequest,
  schemas
};

