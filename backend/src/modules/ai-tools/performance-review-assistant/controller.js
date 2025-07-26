const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.performanceReviewAssistant),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { employeeName, period, achievements, areasForImprovement, goalsForNextPeriod } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO performance_review_assistant_inputs 
         (request_id, employee_name, period, achievements, areas_for_improvement, goals_for_next_period, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [requestId, employeeName, period, achievements, areasForImprovement, goalsForNextPeriod]
      );

      // Process with MetisAI in background
      processPerformanceReviewAssistant(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting performance review assistant input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT performance_review_text, processed_at FROM performance_review_assistant_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { performance_review_text, processed_at } = result.rows[0];

    res.json({
      requestId,
      performanceReviewText: performance_review_text,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting performance review assistant output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processPerformanceReviewAssistant(requestId, data) {
  try {
    const { employeeName, period, achievements, areasForImprovement, goalsForNextPeriod } = data;

    const systemPrompt = `شما یک دستیار بازبینی عملکرد هستید. وظیفه شما تولید بازخوردهای عملکردی جامع و سازنده بر اساس دستاوردها، زمینه های بهبود و اهداف آتی کارکنان است.`;

    let userPrompt = `یک بازبینی عملکرد برای ${employeeName} برای دوره ${period} بنویس.`;

    if (achievements) {
      userPrompt += ` دستاوردهای کلیدی: ${achievements}.`;
    }

    if (areasForImprovement) {
      userPrompt += ` زمینه های بهبود: ${areasForImprovement}.`;
    }

    if (goalsForNextPeriod) {
      userPrompt += ` اهداف برای دوره بعدی: ${goalsForNextPeriod}.`;
    }

    userPrompt += ' بازبینی باید شامل خلاصه ای از عملکرد، نقاط قوت، زمینه های توسعه و اهداف آینده باشد.';

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
        `INSERT INTO performance_review_assistant_outputs (request_id, performance_review_text, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, response.content]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO performance_review_assistant_outputs (request_id, performance_review_text, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, 'خطا در تولید بازبینی عملکرد: ' + response.error]
      );
    }
  } catch (error) {
    console.error('Error processing performance review assistant:', error);
    // Store error in database
    await database.query(
      `INSERT INTO performance_review_assistant_outputs (request_id, performance_review_text, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, 'خطا در پردازش درخواست']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

