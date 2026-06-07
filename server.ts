import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("[CRITICAL ERROR] GEMINI_API_KEY is missing. AI features will not function.");
  console.error("Please add GEMINI_API_KEY to your environment variables (e.g., in Vercel settings).");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY || "AI_KEY_MISSING",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API route for generating itinerary
app.post('/api/validate-locations', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ valid: true, error: "AI Service temporarily unavailable (API Key Missing)" });
  }
  const { origin, originCountry, destination } = req.body;

  const prompt = `Act as a geographical validation engine. 
  Check if the following locations are real cities and countries:
  1. Origin City: "${origin}"
  2. Origin Country: "${originCountry}"
  3. Destination: "${destination}"

  TASK 2: Visual Identity
  Suggest a high-quality relevant high-resolution cover image URL for the destination "${destination}" from Unsplash.
  Return a direct source URL.

  Return a JSON object with:
  "valid": boolean (true if all locations exist and are spelled reasonably well),
  "error": string (a helpful error message if any location is invalid),
  "suggestedImage": string (a direct Unsplash URL for the destination)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            error: { type: Type.STRING },
            suggestedImage: { type: Type.STRING }
          },
          required: ["valid", "error", "suggestedImage"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"valid": false, "error": "Validation failed", "suggestedImage": ""}');
    res.json(result);
  } catch (error) {
    res.json({ valid: true }); // Fallback to allowing if AI is down
  }
});

app.post('/api/generate-itinerary', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: 'AI Service unavailable (API Key Missing)' });
  }
  const { 
    destination, 
    startDate, 
    endDate, 
    partySize, 
    origin, 
    originCountry, 
    transportMode,
    budget,
    currency
  } = req.body;

  if (!destination || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing trip details' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const prompt = `Create a personalized, detailed travel plan for a ${durationDays}-day trip to ${destination} for a party of ${partySize}.
  
  CRITICAL INPUTS:
  1. Office Capital / Starting Point: The user is starting from their office location at ${origin}, ${originCountry}. Arrange travel plans beginning from this origin.
  3. Budget & Economy: The user has a total budget of exactly ${budget} ${currency}. You must tailor all activity suggestions, recommendations, and the daily budget to align perfectly with this budget level of ${budget} ${currency}.
  2. Currency: The currency is "${currency}". All numerical costEstimates and evaluations must be strictly in the scale and value of ${currency}. Do not use USD if another currency was specified! Convert values properly if needed.
  
  TASK 1: Itinerary
  Plan 3-4 distinct specific events per day.
  Include specific, luxury and local-favourite details such as museums, lakes, parks, secret picnic spots, hill springs, and popular activities. 
  Provide approximate numerical latitude (lat) and longitude (lng) for each specific location.
  Provide an approximate costEstimate (RAW numerical value, strictly in "${currency}" currency scale) for each event. Do not use dollar signs or currency symbols in the numerical 'costEstimate' field.
  Include 2-3 relevant tags (e.g. "nature", "history", "fine-dining", "walking") per event.

  TASK 2: Transport Instructions
  Provide detailed instructions on how to travel from the user's office at ${origin}, ${originCountry} to ${destination} via ${transportMode}.
  If via airplane, list specific airline names that typically fly this route and estimated flight duration.
  If via road or waterway, describe the major routes or ports.

  TASK 3: Budget Analysis
  The user has a total budget of ${budget} ${currency}.
  Based on ${destination} prices and the planned itinerary:
  1. Tell the user how many core activities and luxury experiences they can afford with this budget.
  2. Critique the budget. State clearly if it is "right", "wrong", "less good", or "medium" for this length of stay and group size. Explain why in a friendly tone.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "Day number (starting from 1)" },
                  time: { type: Type.STRING, description: "Time in HH:MM format" },
                  name: { type: Type.STRING, description: "Activity name" },
                  category: { type: Type.STRING, description: "activity, food, transport, or accommodation" },
                  location: { type: Type.STRING, description: "Specific place name" },
                  notes: { type: Type.STRING, description: "Details about why it is great" },
                  lat: { type: Type.NUMBER, description: "Approximate latitude" },
                  lng: { type: Type.NUMBER, description: "Approximate longitude" },
                  costEstimate: { type: Type.NUMBER, description: "Numerical cost estimate" },
                  tags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Relevant keywords"
                  }
                },
                required: ["day", "time", "name", "category", "location", "notes", "lat", "lng", "costEstimate", "tags"]
              }
            },
            transportInstructions: { 
              type: Type.STRING, 
              description: "Detailed instructions on how to get there including airlines if applicable" 
            },
            budgetFeedback: { 
              type: Type.STRING, 
              description: "Critique of the budget and count of things they can do" 
            }
          },
          required: ["itinerary", "transportInstructions", "budgetFeedback"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to generate itinerary', details: error.message });
  }
});

// API route for currency conversion rates
app.get('/api/exchange-rates', async (req, res) => {
  const base = (req.query.base as string) || 'USD';
  
  try {
    // We use a reliable public API for conversion rates
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: 'Exchange rate service unavailable' });
    }
    // Fallback: Use Gemini to provide approximate rates if API is down
    try {
      const prompt = `Provide the current approximate exchange rates for ${base} against EUR, GBP, JPY, INR, CAD, AUD, CHF, CNY, AED. 
      Return a JSON object with a "rates" field containing the currency codes as keys and numerical rates as values.`;
      
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rates: {
                type: Type.OBJECT,
                additionalProperties: { type: Type.NUMBER }
              }
            },
            required: ["rates"]
          }
        }
      });
      
      const ratesData = JSON.parse(aiResponse.text || '{"rates": {}}');
      res.json({ ...ratesData, base_code: base, provider: 'gemini_estimation' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch rates' });
    }
  }
});

// Lazy initialization of nodemailer transporter supporting Gmail and SMTP
let mailTransporter: any = null;

function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[MAILER WARNING] SMTP_HOST, SMTP_USER, or SMTP_PASS environment variables are missing. Defaulting to interactive sandbox flow.");
    return null;
  }

  try {
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    return mailTransporter;
  } catch (error) {
    console.error("[MAILER ERROR] Failed to initialize nodemailer transporter:", error);
    return null;
  }
}

// API route for real-time forgot password email dispatch
app.post('/api/send-reset-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  // Create a secure mock reset-token
  const resetToken = `rt-${Math.random().toString(36).substring(2, 11)}`;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const resetLink = `${protocol}://${host}/?resetEmail=${encodeURIComponent(email)}&resetToken=${resetToken}`;

  console.log(`[REAL-TIME SMTP SERVER] password restoration initiated for: ${email}`);
  console.log(`[REAL-TIME SMTP SERVER] recovery link generated: ${resetLink}`);

  let emailDispatched = false;
  let smtpInfo = '';

  try {
    const transporter = getMailTransporter();
    if (transporter) {
      const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
      const mailOptions = {
        from: `"WanderPlan Security" <${fromAddress}>`,
        to: email.trim(),
        subject: "WanderPlan Security Reset Request",
        text: `Hello,\n\nA password restoration was initiated for your WanderPlan account. Click the link below to select a new secure password:\n\n${resetLink}\n\nIf you did not make this request, please disregard this email. Your password remains unmodified.\n\nWarmly,\nThe WanderPlan Dev Team`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF; text-align: left;">
            <div style="display: flex; align-items: center; margin-bottom: 24px;">
              <span style="font-weight: 800; font-size: 22px; color: #0F172A; letter-spacing: -0.025em;">Wander<span style="color: #2563EB;">Plan</span></span>
            </div>
            
            <h2 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">Restoration Initiated</h2>
            <p style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.5; margin: 0 0 16px 0;">Hello,</p>
            <p style="font-size: 14px; font-weight: 500; color: #475569; line-height: 1.5; margin: 0 0 24px 0;">A password restoration was requested for your WanderPlan account. Please click the link button below to establish your new security credentials:</p>
            
            <div style="text-align: center; margin-bottom: 28px;">
              <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; padding: 14px 28px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25);">Select New Password</a>
            </div>
            
            <p style="font-size: 11px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px 0;">Alternative Access Link</p>
            <p style="font-size: 11px; word-break: break-all; color: #2563EB; margin: 0 0 24px 0;"><a href="${resetLink}" target="_blank" style="color: #2563EB; text-decoration: underline;">${resetLink}</a></p>
            
            <hr style="border: 0; border-top: 1px solid #F1F5F9; margin-bottom: 20px;" />
            <p style="font-size: 12px; color: #64748B; margin: 0; line-height: 1.5;">If you didn't trigger this action, please discard this message safely. Your account remains secure.</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[REAL-TIME SMTP SERVER] actual SMTP message dispatched successfully to: ${email}. ID: ${info.messageId}`);
      emailDispatched = true;
      smtpInfo = `Mail sent successfully! Message-ID: ${info.messageId}`;
    }
  } catch (error: any) {
    console.error(`[REAL-TIME SMTP SERVER] failed to send email:`, error);
    smtpInfo = error?.message || String(error);
  }

  res.json({
    success: true,
    message: emailDispatched ? 'Recovery email dispatched in real-time via SMTP transporter' : 'Recovery email simulated inside development sandbox console',
    email,
    resetToken,
    resetLink,
    emailDispatched,
    smtpInfo,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
