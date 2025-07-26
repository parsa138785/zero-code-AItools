const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.jobDescriptionBuilder),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { jobTitle, companyName, location, jobType, requiredExperience, keySkills, additionalResponsibilities, benefits } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO job_description_builder_inputs 
         (request_id, job_title, company_name, location, job_type, required_experience, key_skills, additional_responsibilities, benefits, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [requestId, jobTitle, companyName, location, jobType, requiredExperience, keySkills, additionalResponsibilities, benefits]
      );

      // Process with MetisAI in background
      processJobDescriptionBuilder(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting job description builder input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT job_description, processed_at FROM job_description_builder_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { job_description, processed_at } = result.rows[0];

    res.json({
      requestId,
      jobDescription: job_description,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting job description builder output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processJobDescriptionBuilder(requestId, data) {
  try {
    const { jobTitle, companyName, location, jobType, requiredExperience, keySkills, additionalResponsibilities, benefits } = data;

    const systemPrompt = `شما یک نویسنده حرفه ای آگهی شغلی هستید. وظیفه شما ایجاد توضیحات شغلی جذاب با لحن مناسب، کلمات کلیدی و قالب بندی صحیح است.`;

    let userPrompt = `برای موقعیت شغلی ${jobTitle} در شرکت ${companyName} واقع در ${location}، یک آگهی شغلی حرفه ای بنویسید.`;
    userPrompt += ` نوع شغل: ${jobType}، تجربه مورد نیاز: ${requiredExperience} سال، مهارت های کلیدی: ${keySkills}.`;

    if (additionalResponsibilities) {
      userPrompt += ` مسئولیت های اضافی: ${additionalResponsibilities}.`;
    }

    if (benefits) {
      userPrompt += ` مزایا: ${benefits}.`;
    }

    userPrompt += ' آگهی باید جذاب و شامل کلمات کلیدی مرتبط باشد.';

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    });

    if (response.success) {
      // Store output in database
      await database.query(
        `INSERT INTO job_description_builder_outputs (request_id, job_description, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, response.content]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO job_description_builder_outputs (request_id, job_description, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, 'Error processing request: ' + response.error]
      );
    }
  } catch (error) {
    console.error('Error processing job description builder:', error);
    // Store error in database
    await database.query(
      `INSERT INTO job_description_builder_outputs (request_id, job_description, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, 'Error processing request']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

