const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.interviewSimulator),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { jobRole, interviewType, difficulty } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO interview_simulator_inputs 
         (request_id, job_role, interview_type, difficulty, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [requestId, jobRole, interviewType, difficulty]
      );

      // Process with MetisAI in background
      processInterviewSimulator(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting interview simulator input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT interview_questions, processed_at FROM interview_simulator_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { interview_questions, processed_at } = result.rows[0];

    res.json({
      requestId,
      interviewQuestions: interview_questions,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting interview simulator output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processInterviewSimulator(requestId, data) {
  try {
    const { jobRole, interviewType, difficulty } = data;

    const systemPrompt = `شما یک شبیه ساز مصاحبه هستید. وظیفه شما تولید سوالات مصاحبه مرتبط و واقع گرایانه بر اساس نقش شغلی، نوع مصاحبه و سطح دشواری است.`;

    let userPrompt = `برای نقش شغلی '${jobRole}'`;
    
    if (interviewType) {
      userPrompt += `، سوالات مصاحبه ${interviewType}`;
    }
    
    if (difficulty) {
      userPrompt += ` با سطح دشواری ${difficulty}`;
    }
    
    userPrompt += ' تولید کن. 5 سوال ارائه بده.';

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    });

    if (response.success) {
      // Parse the response to extract questions
      const questions = response.content.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(question => question.length > 0);

      // Store output in database
      await database.query(
        `INSERT INTO interview_simulator_outputs (request_id, interview_questions, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify(questions)]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO interview_simulator_outputs (request_id, interview_questions, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify(['خطا در تولید سوالات مصاحبه: ' + response.error])]
      );
    }
  } catch (error) {
    console.error('Error processing interview simulator:', error);
    // Store error in database
    await database.query(
      `INSERT INTO interview_simulator_outputs (request_id, interview_questions, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, JSON.stringify(['خطا در پردازش درخواست'])]
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

