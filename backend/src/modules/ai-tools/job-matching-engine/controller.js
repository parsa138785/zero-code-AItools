const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.jobMatchingEngine),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { resumeText, jobDescriptionText } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO job_matching_engine_inputs 
         (request_id, resume_text, job_description_text, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [requestId, resumeText, jobDescriptionText]
      );

      // Process with MetisAI in background
      processJobMatchingEngine(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting job matching engine input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT match_percentage, strengths, improvements, processed_at FROM job_matching_engine_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { match_percentage, strengths, improvements, processed_at } = result.rows[0];

    res.json({
      requestId,
      matchPercentage: match_percentage,
      strengths: strengths,
      improvements: improvements,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting job matching engine output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processJobMatchingEngine(requestId, data) {
  try {
    const { resumeText, jobDescriptionText } = data;

    const systemPrompt = `شما یک موتور تطبیق شغل هستید. وظیفه شما تحلیل و مقایسه رزومه با شرح شغل و ارائه درصد تطبیق و نکات کلیدی برای بهبود رزومه است.`;

    const userPrompt = `رزومه زیر را با شرح شغل داده شده مقایسه کن و یک درصد تطبیق ارائه بده. همچنین، نقاط قوت رزومه در رابطه با این شغل و مواردی که می توان برای افزایش تطبیق بهبود داد را لیست کن.

**رزومه:**
${resumeText}

**شرح شغل:**
${jobDescriptionText}`;

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 1500,
      temperature: 0.5
    });

    if (response.success) {
      // Parse the response to extract match percentage, strengths, and improvements
      const content = response.content;
      
      // Extract match percentage (simple regex)
      const matchRegex = /(\d+)%/;
      const matchMatch = content.match(matchRegex);
      const matchPercentage = matchMatch ? parseInt(matchMatch[1]) : 0;

      // Extract strengths and improvements (simplified parsing)
      const lines = content.split('\n').filter(line => line.trim());
      const strengths = [];
      const improvements = [];
      
      let currentSection = '';
      for (const line of lines) {
        if (line.includes('قوت') || line.includes('مزیت')) {
          currentSection = 'strengths';
        } else if (line.includes('بهبود') || line.includes('ضعف')) {
          currentSection = 'improvements';
        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          if (currentSection === 'strengths') {
            strengths.push(line.trim().replace(/^[-•]\s*/, ''));
          } else if (currentSection === 'improvements') {
            improvements.push(line.trim().replace(/^[-•]\s*/, ''));
          }
        }
      }

      // Store output in database
      await database.query(
        `INSERT INTO job_matching_engine_outputs (request_id, match_percentage, strengths, improvements, processed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [requestId, matchPercentage, JSON.stringify(strengths), JSON.stringify(improvements)]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO job_matching_engine_outputs (request_id, match_percentage, strengths, improvements, processed_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [requestId, 0, JSON.stringify(['Error processing request']), JSON.stringify(['Error processing request'])]
      );
    }
  } catch (error) {
    console.error('Error processing job matching engine:', error);
    // Store error in database
    await database.query(
      `INSERT INTO job_matching_engine_outputs (request_id, match_percentage, strengths, improvements, processed_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [requestId, 0, JSON.stringify(['Error processing request']), JSON.stringify(['Error processing request'])]
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

