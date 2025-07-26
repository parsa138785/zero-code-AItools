const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.biasDetector),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { text } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO bias_detector_inputs 
         (request_id, text, created_at)
         VALUES ($1, $2, NOW())`,
        [requestId, text]
      );

      // Process with MetisAI in background
      processBiasDetector(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting bias detector input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT identified_biases, overall_assessment, processed_at FROM bias_detector_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { identified_biases, overall_assessment, processed_at } = result.rows[0];

    res.json({
      requestId,
      identifiedBiases: identified_biases,
      overallAssessment: overall_assessment,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting bias detector output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processBiasDetector(requestId, data) {
  try {
    const { text } = data;

    const systemPrompt = `شما یک تشخیص دهنده تعصب در استخدام هستید. وظیفه شما شناسایی و گزارش هرگونه تعصب (جنسیتی، سنی، نژادی و غیره) در متون مرتبط با استخدام است.`;

    const userPrompt = `متن زیر را برای شناسایی هرگونه تعصب در استخدام (مانند تعصب جنسیتی, سنی, نژادی, یا فرهنگی) تحلیل کن. موارد شناسایی شده را با توضیح و پیشنهاد برای اصلاح ارائه بده.

**متن:**
${text}`;

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.5
    });

    if (response.success) {
      // Parse the response to extract identified biases
      const content = response.content;
      
      // Extract identified biases (simplified parsing)
      const identifiedBiases = [];
      const lines = content.split('\n').filter(line => line.trim());
      
      let currentBias = null;
      for (const line of lines) {
        if (line.includes('تعصب') || line.includes('bias')) {
          if (currentBias) {
            identifiedBiases.push(currentBias);
          }
          currentBias = {
            type: 'شناسایی شده',
            description: line.trim(),
            suggestion: 'نیاز به بررسی بیشتر'
          };
        } else if (currentBias && line.includes('پیشنهاد')) {
          currentBias.suggestion = line.trim();
        }
      }
      
      if (currentBias) {
        identifiedBiases.push(currentBias);
      }

      // If no biases found, add a default assessment
      if (identifiedBiases.length === 0) {
        identifiedBiases.push({
          type: 'بررسی شده',
          description: 'تعصب آشکاری شناسایی نشد',
          suggestion: 'متن نسبتاً خنثی به نظر می‌رسد'
        });
      }

      const overallAssessment = identifiedBiases.length > 1 ? 
        'نیاز به بازنگری در متن وجود دارد' : 
        'متن از نظر تعصب قابل قبول است';

      // Store output in database
      await database.query(
        `INSERT INTO bias_detector_outputs (request_id, identified_biases, overall_assessment, processed_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, JSON.stringify(identifiedBiases), overallAssessment]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO bias_detector_outputs (request_id, identified_biases, overall_assessment, processed_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, JSON.stringify([{ type: 'خطا', description: 'خطا در تحلیل', suggestion: 'لطفاً دوباره تلاش کنید' }]), 'خطا در پردازش']
      );
    }
  } catch (error) {
    console.error('Error processing bias detector:', error);
    // Store error in database
    await database.query(
      `INSERT INTO bias_detector_outputs (request_id, identified_biases, overall_assessment, processed_at)
       VALUES ($1, $2, $3, NOW())`,
      [requestId, JSON.stringify([{ type: 'خطا', description: 'خطا در پردازش درخواست', suggestion: 'لطفاً دوباره تلاش کنید' }]), 'خطا در پردازش درخواست']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

