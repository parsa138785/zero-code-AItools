const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.sentimentAnalysis),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { text } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO sentiment_analysis_inputs 
         (request_id, text, created_at)
         VALUES ($1, $2, NOW())`,
        [requestId, text]
      );

      // Process with MetisAI in background
      processSentimentAnalysis(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting sentiment analysis input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT overall_sentiment, sentiment_phrases, processed_at FROM sentiment_analysis_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { overall_sentiment, sentiment_phrases, processed_at } = result.rows[0];

    res.json({
      requestId,
      overallSentiment: overall_sentiment,
      sentimentPhrases: sentiment_phrases,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting sentiment analysis output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processSentimentAnalysis(requestId, data) {
  try {
    const { text } = data;

    const systemPrompt = `شما یک تحلیلگر احساسات هستید. وظیفه شما تحلیل متن و تعیین احساسات کلی (مثبت، منفی، خنثی) و استخراج عبارات کلیدی مرتبط با احساسات است.`;

    const userPrompt = `احساسات متن زیر را تحلیل کن و مشخص کن که آیا کلیت متن مثبت، منفی یا خنثی است. همچنین، کلمات و عباراتی که نشان دهنده این احساسات هستند را استخراج کن.

**متن:**
${text}`;

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 500,
      temperature: 0.5
    });

    if (response.success) {
      // Parse the response to extract sentiment and phrases
      const content = response.content;
      
      // Extract overall sentiment
      let overallSentiment = 'خنثی';
      if (content.includes('مثبت')) {
        overallSentiment = 'مثبت';
      } else if (content.includes('منفی')) {
        overallSentiment = 'منفی';
      }

      // Extract sentiment phrases (simplified parsing)
      const lines = content.split('\n').filter(line => line.trim());
      const sentimentPhrases = [];
      
      for (const line of lines) {
        if (line.includes('کلمات') || line.includes('عبارات') || line.trim().startsWith('-')) {
          const phrase = line.trim().replace(/^[-•]\s*/, '');
          if (phrase.length > 0 && !phrase.includes('کلمات') && !phrase.includes('عبارات')) {
            sentimentPhrases.push(phrase);
          }
        }
      }

      // Store output in database
      await database.query(
        `INSERT INTO sentiment_analysis_outputs (request_id, overall_sentiment, sentiment_phrases, processed_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, overallSentiment, JSON.stringify(sentimentPhrases)]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO sentiment_analysis_outputs (request_id, overall_sentiment, sentiment_phrases, processed_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, 'خطا', JSON.stringify(['خطا در تحلیل احساسات'])]
      );
    }
  } catch (error) {
    console.error('Error processing sentiment analysis:', error);
    // Store error in database
    await database.query(
      `INSERT INTO sentiment_analysis_outputs (request_id, overall_sentiment, sentiment_phrases, processed_at)
       VALUES ($1, $2, $3, NOW())`,
      [requestId, 'خطا', JSON.stringify(['خطا در پردازش درخواست'])]
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

