-- Zero Code AI Tools Database Migration
-- This script creates all necessary tables for the AI tools backend

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Job Title Optimization Tables
CREATE TABLE IF NOT EXISTS job_title_optimization_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    current_job_title VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    experience_level VARCHAR(100) NOT NULL,
    location_type VARCHAR(100) NOT NULL,
    keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_title_optimization_outputs (
    request_id UUID PRIMARY KEY REFERENCES job_title_optimization_inputs(request_id) ON DELETE CASCADE,
    optimized_titles JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Job Description Builder Tables
CREATE TABLE IF NOT EXISTS job_description_builder_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    required_experience INTEGER NOT NULL,
    key_skills TEXT NOT NULL,
    additional_responsibilities TEXT,
    benefits TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_description_builder_outputs (
    request_id UUID PRIMARY KEY REFERENCES job_description_builder_inputs(request_id) ON DELETE CASCADE,
    job_description TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Global Job Search Tables
CREATE TABLE IF NOT EXISTS global_job_search_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keywords VARCHAR(500) NOT NULL,
    location VARCHAR(255),
    job_type VARCHAR(100),
    experience_level VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_job_search_outputs (
    request_id UUID PRIMARY KEY REFERENCES global_job_search_inputs(request_id) ON DELETE CASCADE,
    job_listings JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Job Matching Engine Tables
CREATE TABLE IF NOT EXISTS job_matching_engine_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_text TEXT NOT NULL,
    job_description_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_matching_engine_outputs (
    request_id UUID PRIMARY KEY REFERENCES job_matching_engine_inputs(request_id) ON DELETE CASCADE,
    match_percentage INTEGER NOT NULL DEFAULT 0,
    strengths JSONB NOT NULL,
    improvements JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Chat Assistant Tables
CREATE TABLE IF NOT EXISTS chat_assistant_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    conversation_history JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_assistant_outputs (
    request_id UUID PRIMARY KEY REFERENCES chat_assistant_inputs(request_id) ON DELETE CASCADE,
    assistant_reply TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Personalized Message Generator Tables
CREATE TABLE IF NOT EXISTS personalized_message_generator_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_name VARCHAR(255) NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    key_points TEXT NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    tone VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personalized_message_generator_outputs (
    request_id UUID PRIMARY KEY REFERENCES personalized_message_generator_inputs(request_id) ON DELETE CASCADE,
    generated_message TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Recruitment Automation Tables
CREATE TABLE IF NOT EXISTS recruitment_automation_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_title VARCHAR(255) NOT NULL,
    required_skills TEXT NOT NULL,
    experience_years INTEGER NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recruitment_automation_outputs (
    request_id UUID PRIMARY KEY REFERENCES recruitment_automation_inputs(request_id) ON DELETE CASCADE,
    candidates JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Resume Screening Tables
CREATE TABLE IF NOT EXISTS resume_screening_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_text TEXT NOT NULL,
    job_description_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_screening_outputs (
    request_id UUID PRIMARY KEY REFERENCES resume_screening_inputs(request_id) ON DELETE CASCADE,
    extracted_info JSONB NOT NULL,
    match_analysis TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Interview Simulator Tables
CREATE TABLE IF NOT EXISTS interview_simulator_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_role VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100),
    difficulty VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_simulator_outputs (
    request_id UUID PRIMARY KEY REFERENCES interview_simulator_inputs(request_id) ON DELETE CASCADE,
    interview_questions JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Employee Training Assistant Tables
CREATE TABLE IF NOT EXISTS employee_training_assistant_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    onboarding_topic VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    format VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_training_assistant_outputs (
    request_id UUID PRIMARY KEY REFERENCES employee_training_assistant_inputs(request_id) ON DELETE CASCADE,
    training_material TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. One-on-One Optimizer Tables
CREATE TABLE IF NOT EXISTS one_on_one_optimizer_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_purpose VARCHAR(500) NOT NULL,
    attendees VARCHAR(500) NOT NULL,
    last_meeting_topics TEXT,
    upcoming_projects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS one_on_one_optimizer_outputs (
    request_id UUID PRIMARY KEY REFERENCES one_on_one_optimizer_inputs(request_id) ON DELETE CASCADE,
    meeting_agenda TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Sentiment Analysis Tables
CREATE TABLE IF NOT EXISTS sentiment_analysis_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sentiment_analysis_outputs (
    request_id UUID PRIMARY KEY REFERENCES sentiment_analysis_inputs(request_id) ON DELETE CASCADE,
    overall_sentiment VARCHAR(100) NOT NULL,
    sentiment_phrases JSONB NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Bias Detector Tables
CREATE TABLE IF NOT EXISTS bias_detector_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bias_detector_outputs (
    request_id UUID PRIMARY KEY REFERENCES bias_detector_inputs(request_id) ON DELETE CASCADE,
    identified_biases JSONB NOT NULL,
    overall_assessment TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Performance Review Assistant Tables
CREATE TABLE IF NOT EXISTS performance_review_assistant_inputs (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_name VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    achievements TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_review_assistant_outputs (
    request_id UUID PRIMARY KEY REFERENCES performance_review_assistant_inputs(request_id) ON DELETE CASCADE,
    performance_review_text TEXT NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_title_optimization_inputs_created_at ON job_title_optimization_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_job_description_builder_inputs_created_at ON job_description_builder_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_global_job_search_inputs_created_at ON global_job_search_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_job_matching_engine_inputs_created_at ON job_matching_engine_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_assistant_inputs_created_at ON chat_assistant_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_personalized_message_generator_inputs_created_at ON personalized_message_generator_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_recruitment_automation_inputs_created_at ON recruitment_automation_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_resume_screening_inputs_created_at ON resume_screening_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_interview_simulator_inputs_created_at ON interview_simulator_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_employee_training_assistant_inputs_created_at ON employee_training_assistant_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_one_on_one_optimizer_inputs_created_at ON one_on_one_optimizer_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_inputs_created_at ON sentiment_analysis_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_bias_detector_inputs_created_at ON bias_detector_inputs(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_review_assistant_inputs_created_at ON performance_review_assistant_inputs(created_at);

-- Add comments to tables for documentation
COMMENT ON TABLE job_title_optimization_inputs IS 'Stores input data for job title optimization requests';
COMMENT ON TABLE job_title_optimization_outputs IS 'Stores optimized job titles generated by AI';
COMMENT ON TABLE job_description_builder_inputs IS 'Stores input data for job description building requests';
COMMENT ON TABLE job_description_builder_outputs IS 'Stores generated job descriptions';
COMMENT ON TABLE global_job_search_inputs IS 'Stores input data for global job search requests';
COMMENT ON TABLE global_job_search_outputs IS 'Stores job search results';
COMMENT ON TABLE job_matching_engine_inputs IS 'Stores input data for job matching requests';
COMMENT ON TABLE job_matching_engine_outputs IS 'Stores job matching analysis results';
COMMENT ON TABLE chat_assistant_inputs IS 'Stores chat messages and conversation history';
COMMENT ON TABLE chat_assistant_outputs IS 'Stores AI assistant responses';
COMMENT ON TABLE personalized_message_generator_inputs IS 'Stores input data for personalized message generation';
COMMENT ON TABLE personalized_message_generator_outputs IS 'Stores generated personalized messages';
COMMENT ON TABLE recruitment_automation_inputs IS 'Stores input data for recruitment automation requests';
COMMENT ON TABLE recruitment_automation_outputs IS 'Stores candidate search results';
COMMENT ON TABLE resume_screening_inputs IS 'Stores input data for resume screening requests';
COMMENT ON TABLE resume_screening_outputs IS 'Stores resume analysis results';
COMMENT ON TABLE interview_simulator_inputs IS 'Stores input data for interview simulation requests';
COMMENT ON TABLE interview_simulator_outputs IS 'Stores generated interview questions';
COMMENT ON TABLE employee_training_assistant_inputs IS 'Stores input data for training material generation';
COMMENT ON TABLE employee_training_assistant_outputs IS 'Stores generated training materials';
COMMENT ON TABLE one_on_one_optimizer_inputs IS 'Stores input data for meeting optimization requests';
COMMENT ON TABLE one_on_one_optimizer_outputs IS 'Stores generated meeting agendas';
COMMENT ON TABLE sentiment_analysis_inputs IS 'Stores input data for sentiment analysis requests';
COMMENT ON TABLE sentiment_analysis_outputs IS 'Stores sentiment analysis results';
COMMENT ON TABLE bias_detector_inputs IS 'Stores input data for bias detection requests';
COMMENT ON TABLE bias_detector_outputs IS 'Stores bias detection results';
COMMENT ON TABLE performance_review_assistant_inputs IS 'Stores input data for performance review generation';
COMMENT ON TABLE performance_review_assistant_outputs IS 'Stores generated performance reviews';

