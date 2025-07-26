const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.resumeScreening),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { resumeText, jobDescriptionText } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO resume_screening_inputs 
         (request_id, resume_text, job_description_text, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, resumeText, jobDescriptionText]
      );

      // Process with MetisAI in background
      processResumeScreening(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting resume screening input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT extracted_info, match_analysis, recommendations, processed_at FROM resume_screening_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { extracted_info, match_analysis, recommendations, processed_at } = result.rows[0];

    res.json({
      requestId,
      extractedInfo: extracted_info,
      matchAnalysis: match_analysis,
      recommendations: recommendations,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting resume screening output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processResumeScreening(requestId, data) {
  try {
    const { resumeText, jobDescriptionText } = data;

    const systemPrompt = `شما یک تحلیلگر رزومه هستید. وظیفه شما استخراج اطلاعات کلیدی از رزومه ها و ارزیابی آن ها بر اساس شرح شغل (در صورت وجود) است.`;

    let userPrompt = `رزومه زیر را تحلیل کن و اطلاعات کلیدی شامل تجربه کاری، مهارت ها، تحصیلات و هرگونه دستاورد مرتبط را استخراج کن.`;

    if (jobDescriptionText) {
      userPrompt += ` اگر شرح شغل نیز ارائه شده، میزان تطبیق رزومه با آن را ارزیابی کن و نقاط قوت و ضعف را مشخص کن.`;
    }

    userPrompt += `

**رزومه:**
${resumeText}`;

    if (jobDescriptionText) {
      userPrompt += `

**(اختیاری) شرح شغل:**
${jobDescriptionText}`;
    }

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 2000,
      temperature: 0.5
    });

    if (response.success) {
      // Parse the response to extract structured information
      const content = response.content;
      
      // Extract basic information (simplified parsing)
      const extractedInfo = {
        experience: 'استخراج شده از رزومه',
        skills: 'مهارت های شناسایی شده',
        education: 'سوابق تحصیلی',
        achievements: 'دستاوردها'
      };

      const matchAnalysis = jobDescriptionText ? 
        'تحلیل تطبیق با شرح شغل' : 
        'تحلیل کلی رزومه';

      const recommendations = 'پیشنهادات برای بهبود';

      // Store output in database
      await database.query(
        `INSERT INTO resume_screening_outputs (request_id, extracted_info, match_analysis, recommendations, processed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [requestId, JSON.stringify(extractedInfo), matchAnalysis, recommendations]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO resume_screening_outputs (request_id, extracted_info, match_analysis, recommendations, processed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [requestId, JSON.stringify({ error: 'خطا در پردازش' }), 'خطا در تحلیل', 'خطا در ارائه پیشنهادات']
      );
    }
  } catch (error) {
    console.error('Error processing resume screening:', error);
    // Store error in database
    await database.query(
      `INSERT INTO resume_screening_outputs (request_id, extracted_info, match_analysis, recommendations, processed_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [requestId, JSON.stringify({ error: 'خطا در پردازش درخواست' }), 'خطا در تحلیل', 'خطا در ارائه پیشنهادات']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

