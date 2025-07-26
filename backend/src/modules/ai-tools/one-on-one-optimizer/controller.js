const { v4: uuidv4 } = require('uuid');
const database = require('../../../common/database');
const metisAI = require('../../../common/metis-ai');
const { validateRequest, schemas } = require('../../../common/validation');

const submitInput = [
  validateRequest(schemas.oneOnOneOptimizer),
  async (req, res) => {
    try {
      const requestId = uuidv4();
      const { meetingPurpose, attendees, lastMeetingTopics, upcomingProjects } = req.body;

      // Store input in database
      await database.query(
        `INSERT INTO one_on_one_optimizer_inputs 
         (request_id, meeting_purpose, attendees, last_meeting_topics, upcoming_projects, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [requestId, meetingPurpose, attendees, lastMeetingTopics, upcomingProjects]
      );

      // Process with MetisAI in background
      processOneOnOneOptimizer(requestId, req.body);

      res.json({ requestId });
    } catch (error) {
      console.error('Error submitting one-on-one optimizer input:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
];

const getOutput = async (req, res) => {
  try {
    const { requestId } = req.params;

    const result = await database.query(
      'SELECT meeting_agenda, processed_at FROM one_on_one_optimizer_outputs WHERE request_id = $1',
      [requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Output not found or still processing' });
    }

    const { meeting_agenda, processed_at } = result.rows[0];

    res.json({
      requestId,
      meetingAgenda: meeting_agenda,
      processedAt: processed_at
    });
  } catch (error) {
    console.error('Error getting one-on-one optimizer output:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processOneOnOneOptimizer(requestId, data) {
  try {
    const { meetingPurpose, attendees, lastMeetingTopics, upcomingProjects } = data;

    const systemPrompt = `شما یک بهینه ساز جلسات یک به یک هستید. وظیفه شما تولید دستور کار (Agenda) مؤثر و مرتبط برای جلسات یک به یک است.`;

    let userPrompt = `یک دستور کار برای جلسه یک به یک با هدف "${meetingPurpose}" بین "${attendees}" ایجاد کن.`;

    if (lastMeetingTopics) {
      userPrompt += ` موضوعات جلسه قبلی: "${lastMeetingTopics}".`;
    }

    if (upcomingProjects) {
      userPrompt += ` پروژه های آتی: "${upcomingProjects}".`;
    }

    userPrompt += ' دستور کار باید شامل موارد بحث، اهداف و اقدامات پیشنهادی باشد.';

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
        `INSERT INTO one_on_one_optimizer_outputs (request_id, meeting_agenda, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, response.content]
      );
    } else {
      console.error('MetisAI error for request', requestId, ':', response.error);
      // Store error in database
      await database.query(
        `INSERT INTO one_on_one_optimizer_outputs (request_id, meeting_agenda, processed_at)
         VALUES ($1, $2, NOW())`,
        [requestId, 'خطا در تولید دستور کار جلسه: ' + response.error]
      );
    }
  } catch (error) {
    console.error('Error processing one-on-one optimizer:', error);
    // Store error in database
    await database.query(
      `INSERT INTO one_on_one_optimizer_outputs (request_id, meeting_agenda, processed_at)
       VALUES ($1, $2, NOW())`,
      [requestId, 'خطا در پردازش درخواست']
    );
  }
}

module.exports = {
  submitInput,
  getOutput
};

