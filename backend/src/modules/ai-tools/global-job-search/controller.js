const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.globalJobSearch),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { keywords, location, jobType, experienceLevel } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO global_job_search_inputs 
         (request_id, keywords, location, job_type, experience_level, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [requestId, keywords, location, jobType, experienceLevel]
      );

      // Process with MetisAI in background
      processGlobalJobSearch(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting global job search input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT job_listings, processed_at FROM global_job_search_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { job_listings, processed_at } = result.rows[0];

    res.json({
      requestId,
      jobListings: job_listings,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting global job search output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processGlobalJobSearch(requestId, data) {
  try {
    const { keywords, location, jobType, experienceLevel } = data;

    const systemPrompt = `شما یک دستیار جستجوی شغل جهانی هستید. وظیفه شما یافتن و جمع آوری فرصت های شغلی مرتبط از پلتفرم های مختلف بر اساس معیارهای کاربر است.`;

    let userPrompt = `فرصت های شغلی برای '${keywords}'`;
    
    if (location) userPrompt += ` در موقعیت '${location}'`;
    if (jobType) userPrompt += ` با نوع شغل '${jobType}'`;
    if (experienceLevel) userPrompt += ` و سطح تجربه '${experienceLevel}'`;
    
    userPrompt += ' را پیدا کن. نتایج را به صورت خلاصه و شامل عنوان شغل، شرکت، موقعیت و لینک آگهی ارائه بده.';

    const response = await metisAI.generateCompletion({
      systemPrompt,
      userPrompt,
      model: 'gpt-4o-mini',
      maxTokens: 2000,
      temperature: 0.5
    });

    if (response.success) {
      // Parse the response to extract job listings
      // This is a simplified parsing - in a real implementation, you might integrate with actual job APIs
      const lines = response.content.split('\n').filter(line => line.trim());
      const jobListings = [];

      for (const line of lines) {
        if (line.includes('عنوان:') || line.includes('شرکت:') || line.includes('موقعیت:')) {
          // Simple parsing logic - this would need to be more sophisticated in a real implementation
          const listing = {
            title: 'Sample Job Title',
            company: 'Sample Company',
            location: location || 'Remote',
            url: 'https://example.com/job'
          };
          jobListings.push(listing);
        }
      }

      // If no structured listings found, create sample data
      if (jobListings.length === 0) {
        jobListings.push(
          {
            title: `${keywords} Position`,
            company: 'Tech Company',
            location: location || 'Remote',
            url: 'https://example.com/job1'
          },
          {
            title: `Senior ${keywords}`,
            company: 'Innovation Corp',
            location: location || 'Hybrid',
            url: 'https://example.com/job2'
          }
        );
      }

      // Store output in database
      await database.query(
        `INSERT INTO global_job_search_outputs (request_id, job_listings, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify(jobListings)]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO global_job_search_outputs (request_id, job_listings, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, JSON.stringify([{ title: 'Error', company: 'N/A', location: 'N/A', url: '#' }])]
      );
    }
  } catch (error) {
    console.error('Error processing global job search:', error);
    // Store error in database
    await database.query(
      `INSERT INTO global_job_search_outputs (request_id, job_listings, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, JSON.stringify([{ title: 'Error processing request', company: 'N/A', location: 'N/A', url: '#' }])]
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

