const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.chatAssistant),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { message, conversationHistory } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO chat_assistant_inputs 
         (request_id, message, conversation_history, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, message, JSON.stringify(conversationHistory || [])]
      );

      // Process with MetisAI in background
      processChatAssistant(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting chat assistant input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT assistant_reply, processed_at FROM chat_assistant_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { assistant_reply, processed_at } = result.rows[0];

    res.json({
      requestId,
      assistantReply: assistant_reply,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting chat assistant output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processChatAssistant(requestId, data) {
  try {
    const { message, conversationHistory } = data;

    const systemPrompt = `شما یک دستیار چت هوش مصنوعی برای حوزه منابع انسانی هستید. به سوالات کاربران با دقت و مفید پاسخ دهید.`;

    // Build messages array for chat completion
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const historyMessage of conversationHistory) {
        messages.push({
          role: historyMessage.role,
          content: historyMessage.content
        });
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await metisAI.generateChatCompletion({
      messages,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    });

    if (response.success) {
      // Store output in database
      await database.query(
        `INSERT INTO chat_assistant_outputs (request_id, assistant_reply, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, response.content]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO chat_assistant_outputs (request_id, assistant_reply, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, 'متأسفم، در حال حاضر قادر به پردازش درخواست شما نیستم. لطفاً دوباره تلاش کنید.']
      );
    }
  } catch (error) {
    console.error('Error processing chat assistant:', error);
    // Store error in database
    await database.query(
      `INSERT INTO chat_assistant_outputs (request_id, assistant_reply, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, 'خطایی در پردازش درخواست رخ داده است.']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

