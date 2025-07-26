const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.employeeTrainingAssistant),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { onboardingTopic, role, format } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO employee_training_assistant_inputs 
         (request_id, onboarding_topic, role, format, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [requestId, onboardingTopic, role, format]
      );

      // Process with MetisAI in background
      processEmployeeTrainingAssistant(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting employee training assistant input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT training_material, processed_at FROM employee_training_assistant_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { training_material, processed_at } = result.rows[0];

    res.json({
      requestId,
      trainingMaterial: training_material,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting employee training assistant output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processEmployeeTrainingAssistant(requestId, data) {
  try {
    const { onboardingTopic, role, format } = data;

    const systemPrompt = `شما یک دستیار آموزش کارکنان جدید هستید. وظیفه شما تولید محتوای آموزشی جذاب و مفید برای موضوعات مختلف آنبوردینگ است.`;

    let userPrompt = `محتوای آموزشی برای موضوع آنبوردینگ "${onboardingTopic}"`;
    
    if (role) {
      userPrompt += ` برای نقش "${role}"`;
    }
    
    if (format) {
      userPrompt += ` در قالب "${format}"`;
    }
    
    userPrompt += ' تولید کن.';

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 1500,
      temperature: 0.7
    });

    if (response.success) {
      // Store output in database
      await database.query(
        `INSERT INTO employee_training_assistant_outputs (request_id, training_material, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, response.content]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO employee_training_assistant_outputs (request_id, training_material, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, 'خطا در تولید محتوای آموزشی: ' + response.error]
      );
    }
  } catch (error) {
    console.error('Error processing employee training assistant:', error);
    // Store error in database
    await database.query(
      `INSERT INTO employee_training_assistant_outputs (request_id, training_material, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, 'خطا در پردازش درخواست']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

