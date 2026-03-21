const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');
const cors = require('cors')({ origin: true });
const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');

// Initialize Firebase Admin for Firestore logging
admin.initializeApp();

// Load Twilio credentials from environment
// When deploying to production Firebase, use functions.config() or Google Cloud Secret Manager
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || 'AC_YOUR_TWILIO_SID';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_TOKEN';
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || 'YOUR_TWILIO_PHONE';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

const twilioClient = twilio(TWILIO_SID, TWILIO_TOKEN);

/**
 * HTTP Cloud Function to send an SOS SMS via Twilio.
 * Also logs the emergency event to Firestore.
 */
exports.sendEmergencyAlert = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { location, contactPhone, userName } = req.body;

    if (!location || !contactPhone) {
      return res.status(400).send({ error: 'Missing location or contactPhone in request body' });
    }

    // Google Maps standard URL format for pin dropping
    const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    const messageBody = `[SOLO GUARDIAN SOS]\nCảnh báo khẩn cấp: ${userName || 'Người thân của bạn'} có thể đang gặp nguy hiểm hoặc đi chệch khỏi lộ trình an toàn!\n\nVị trí hiện tại: ${mapUrl}`;

    try {
      console.log(`Attempting to send SOS SMS to: ${contactPhone}`);

      const message = await twilioClient.messages.create({
        body: messageBody,
        from: TWILIO_PHONE,
        to: contactPhone
      });

      console.log('SMS sent successfully. SID:', message.sid);

      // Save anomaly to Firestore logs
      await admin.firestore().collection('sos_logs').add({
        location,
        contactPhone,
        userName: userName || 'Unknown',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'sms_sent',
        messageSid: message.sid
      });

      return res.status(200).send({ success: true, messageId: message.sid });
    } catch (error) {
      console.error('Error sending Twilio SMS:', error);
      return res.status(500).send({ success: false, error: error.message });
    }
  });
});

/**
 * HTTP Cloud Function to analyze transcribed audio using LangChain + OpenAI.
 * Determines if the situation is dangerous based on context, keywords, and tone.
 */
exports.analyzeAudioContext = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).send({ error: 'Missing transcript in request body' });
    }

    try {
      const llm = new ChatOpenAI({
        apiKey: OPENAI_API_KEY,
        modelName: 'gpt-4o-mini',
        temperature: 0,
      });

      const template = `You are a Solo Guardian emergency AI assistant.
Read the following transcribed audio snippet from a user's phone while they are walking alone at night.
Determine if there are signs of danger, offensive remarks, threats, or an emergency situation.
If the transcript is just normal background noise or harmless conversation, return isDanger: false.

Respond ONLY with a valid JSON object in this format: 
{{"isDanger": true/false, "reason": "brief explanation"}}

Transcript: "{transcript}"`;

      const prompt = PromptTemplate.fromTemplate(template);
      const chain = prompt.pipe(llm);

      const result = await chain.invoke({ transcript });

      // Attempt to parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(result.content.trim());
      } catch (e) {
        // Fallback extraction if LLM adds markdown formatting like \`\`\`json
        const match = result.content.match(/\{[\s\S]*\}/);
        parsedResponse = match ? JSON.parse(match[0]) : { isDanger: false, reason: "Unparseable response", raw: result.content };
      }

      return res.status(200).send(parsedResponse);
    } catch (error) {
      console.error('Error analyzing audio context:', error);
      return res.status(500).send({ error: error.message });
    }
  });
});

