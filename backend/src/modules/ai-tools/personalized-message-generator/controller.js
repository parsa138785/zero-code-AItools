const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.personalizedMessageGenerator),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { recipientName, purpose, keyPoints, senderName, tone } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO personalized_message_generator_inputs 
         (request_id, recipient_name, purpose, key_points, sender_name, tone, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [requestId, recipientName, purpose, keyPoints, senderName, tone]
      );

      // Process with MetisAI in background
      processPersonalizedMessageGenerator(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting personalized message generator input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT generated_message, processed_at FROM personalized_message_generator_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { generated_message, processed_at } = result.rows[0];

    res.json({
      requestId,
      generatedMessage: generated_message,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting personalized message generator output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processPersonalizedMessageGenerator(requestId, data) {
  try {
    const { recipientName, purpose, keyPoints, senderName, tone } = data;

    const systemPrompt = `شما یک تولیدکننده پیام های شخصی سازی شده هستید. وظیفه شما ایجاد پیام های متناسب با هدف و گیرنده، با لحن مناسب و شامل نکات کلیدی است.`;

    let userPrompt = `یک پیام شخصی سازی شده برای ${recipientName} با هدف ${purpose} بنویس. نکات کلیدی که باید در پیام گنجانده شود: ${keyPoints}. فرستنده پیام ${senderName} است.`;

    if (tone) {
      userPrompt += ` لحن پیام باید ${tone} باشد.`;
    }

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.7
    });

    if (response.success) {
      // Store output in database
      await database.query(
        `INSERT INTO personalized_message_generator_outputs (request_id, generated_message, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, response.content]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO personalized_message_generator_outputs (request_id, generated_message, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, 'خطا در تولید پیام: ' + response.error]
      );
    }
  } catch (error) {
    console.error('Error processing personalized message generator:', error);
    // Store error in database
    await database.query(
      `INSERT INTO personalized_message_generator_outputs (request_id, generated_message, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, 'خطا در پردازش درخواست']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

