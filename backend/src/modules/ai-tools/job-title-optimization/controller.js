const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.jobTitleOptimization),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { currentJobTitle, industry, experienceLevel, locationType, keywords } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO job_title_optimization_inputs 
         (request_id, current_job_title, industry, experience_level, location_type, keywords, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [requestId, currentJobTitle, industry, experienceLevel, locationType, keywords]
      );

      // Process with MetisAI in background
      processJobTitleOptimization(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting job title optimization input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT optimized_titles, processed_at FROM job_title_optimization_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { optimized_titles, processed_at } = result.rows[0];

    res.json({
      requestId,
      optimizedTitles: optimized_titles,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting job title optimization output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processJobTitleOptimization(requestId, data) {
  try {
    const { currentJobTitle, industry, experienceLevel, locationType, keywords } = data;

    const systemPrompt = `شما یک متخصص بهینه سازی عنوان شغلی هستید. وظیفه شما تولید عناوین شغلی جذاب و بهینه برای سئو است که بتواند کاندیدهای مناسب را جذب کند.`;

    let userPrompt = `برای موقعیت شغلی ${currentJobTitle} در صنعت ${industry} با سطح تجربه ${experienceLevel} و نوع مکان ${locationType}، عناوین شغلی جذاب و بهینه برای سئو پیشنهاد دهید.`;

    if (keywords) {
      userPrompt += ` کلمات کلیدی اضافی: ${keywords}.`;
    }

    userPrompt += ' 3 تا 5 پیشنهاد ارائه دهید.';

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    });

    if (response.success) {
      // Parse the response to extract titles
      const titles = response.content.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(title => title.length > 0);

      // Store output in database
      await database.query(
        `INSERT INTO job_title_optimization_outputs (request_id, optimized_titles, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify(titles)]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO job_title_optimization_outputs (request_id, optimized_titles, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify(['Error processing request: ' + response.error])]
      );
    }
  } catch (error) {
    console.error('Error processing job title optimization:', error);
    // Store error in database
    await database.query(
      `INSERT INTO job_title_optimization_outputs (request_id, optimized_titles, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, JSON.stringify(['Error processing request'])]
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

