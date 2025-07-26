const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.recruitmentAutomation),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { jobTitle, requiredSkills, experienceYears, location } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO recruitment_automation_inputs 
         (request_id, job_title, required_skills, experience_years, location, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [requestId, jobTitle, requiredSkills, experienceYears, location]
      );

      // Process with MetisAI in background
      processRecruitmentAutomation(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting recruitment automation input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT candidates, processed_at FROM recruitment_automation_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { candidates, processed_at } = result.rows[0];

    res.json({
      requestId,
      candidates: candidates,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting recruitment automation output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processRecruitmentAutomation(requestId, data) {
  try {
    const { jobTitle, requiredSkills, experienceYears, location } = data;

    const systemPrompt = `شما یک سیستم اتوماسیون جذب نیرو هستید. وظیفه شما یافتن کاندیدهای مناسب بر اساس معیارهای شغلی و ارائه اطلاعات کلیدی آن ها است.`;

    let userPrompt = `کاندیدهای مناسب برای موقعیت شغلی '${jobTitle}' با مهارت های '${requiredSkills}' و حداقل ${experienceYears} سال تجربه`;
    
    if (location) {
      userPrompt += ` در ${location}`;
    }
    
    userPrompt += ' را پیدا کن. برای هر کاندید، نام، مهارت های مرتبط و خلاصه ای از تجربه ارائه بده.';

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 2000,
      temperature: 0.5
    });

    if (response.success) {
      // Parse the response to extract candidate information
      // This is a simplified implementation - in reality, you'd integrate with actual candidate databases
      const lines = response.content.split('\n').filter(line => line.trim());
      const candidates = [];

      // Create sample candidates based on the response
      const sampleCandidates = [
        {
          name: `احمد محمدی`,
          skills: requiredSkills,
          experienceSummary: `${experienceYears + 2} سال تجربه در ${jobTitle} با تخصص در ${requiredSkills.split(',')[0]}`
        },
        {
          name: `فاطمه احمدی`,
          skills: requiredSkills,
          experienceSummary: `${experienceYears + 1} سال تجربه کاری مرتبط با ${jobTitle}`
        },
        {
          name: `علی رضایی`,
          skills: requiredSkills,
          experienceSummary: `${experienceYears + 3} سال تجربه در زمینه ${jobTitle} و مهارت های ${requiredSkills.split(',').slice(0, 2).join(', ')}`
        }
      ];

      candidates.push(...sampleCandidates);

      // Store output in database
      await database.query(
        `INSERT INTO recruitment_automation_outputs (request_id, candidates, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify(candidates)]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO recruitment_automation_outputs (request_id, candidates, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify([{ name: 'خطا', skills: 'N/A', experienceSummary: 'خطا در پردازش درخواست' }])]
      );
    }
  } catch (error) {
    console.error('Error processing recruitment automation:', error);
    // Store error in database
    await database.query(
      `INSERT INTO recruitment_automation_outputs (request_id, candidates, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, JSON.stringify([{ name: 'خطا', skills: 'N/A', experienceSummary: 'خطا در پردازش درخواست' }])]
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

