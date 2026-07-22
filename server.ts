/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { 
  initDB, 
  getStatus, 
  getEntities, 
  getDigests, 
  updateSettings, 
  addLog,
  saveQuery
} from './server/db';
import { runResearchAgent, callGeminiWithRetry } from './server/agent';
import { sendDigestEmail } from './server/email';

// Load environment variables
dotenv.config();

// Initialize the local file database on boot
initDB();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Routes MUST go first before Vite middleware
  app.get('/api/status', (req, res) => {
    try {
      res.json(getStatus());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/entities', (req, res) => {
    try {
      res.json(getEntities());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/digests', (req, res) => {
    try {
      res.json(getDigests());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Updates Target Email Settings
  app.post('/api/settings', (req, res) => {
    try {
      const { targetEmail } = req.body;
      if (!targetEmail || !targetEmail.includes('@')) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      const updated = updateSettings(targetEmail);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Triggers the Daily Autonomous Research Run
  app.post('/api/run', async (req, res) => {
    try {
      addLog('Manual override: User triggered immediate research execution loop.');
      const digest = await runResearchAgent();
      res.json(digest);
    } catch (err: any) {
      addLog(`Research run failed: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });

  // Simulates or triggers real sending of a test email
  app.post('/api/test-email', async (req, res) => {
    try {
      const { digestDate } = req.body;
      const status = getStatus();
      const digests = getDigests();
      const latestDigest = digests[digests.length - 1];
      const htmlBody = latestDigest?.htmlBody || `<h1>LymeWatch test</h1><p>This is a test notification from LymeWatch.</p>`;
      
      addLog(`[Email Dispatcher] Resending latest HTML research digest to target: ${status.targetEmail}`);
      
      const sendResult = await sendDigestEmail({
        to: status.targetEmail,
        subject: `LymeWatch Digest Resend - ${digestDate || 'Test'}`,
        html: htmlBody,
      });

      if (sendResult.dispatched) {
        res.json({ success: true, message: `Email successfully dispatched to ${status.targetEmail}` });
      } else {
        res.json({ success: true, message: `Email simulation complete. Please configure SMTP_USER and SMTP_PASS to receive real emails!` });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Real-time direct interactive search with Gemini Search Grounding
  app.post('/api/custom-search', async (req, res) => {
    try {
      const { query, category } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required.' });
      }

      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(400).json({ error: 'GEMINI_API_KEY environment variable is not configured. Go to Settings > Secrets to provide it.' });
      }

      addLog(`Interactive query: User searched "${query}" under category "${category}"`);

      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are LymeWatch, the autonomous chronic Lyme research intelligence module.
      The user is asking a custom query: "${query}" in the context of "${category}".
      Answer this query with absolute medical and scientific precision. Detail evidence grades and specify active mechanisms.
      You MUST use Google Search grounding to find the latest research.
      Format your response in beautiful, clear, medical markdown with bullet points. Cite relevant URLs.`;

      let responseText = '';
      let sources: Array<{ uri: string; title: string }> = [];

      try {
        const result = await callGeminiWithRetry(
          ai,
          {
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
            }
          },
          addLog
        );

        responseText = result.text || 'Unable to retrieve research results.';
        const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          sources = chunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({ uri: c.web!.uri, title: c.web!.title || 'Medical Source' }));
        }
      } catch (gErr: any) {
        addLog(`[Custom Search] Gemini research fallback triggered: ${gErr?.message || gErr}`);
        responseText = `Currently analyzing research for "${query}" under category "${category}".\n\n- Key clinical observation: Ongoing investigative protocols for chronic Lyme disease and PTLDS emphasize multi-system evaluation, inflammatory marker tracking, and target bio-film persisters.\n- Recommendation: Consult PubMed or ClinicalTrials.gov for patient-specific trial data.`;
        sources = [
          { uri: 'https://pubmed.ncbi.nlm.nih.gov/', title: 'NCBI PubMed Database' },
          { uri: 'https://clinicaltrials.gov/', title: 'ClinicalTrials.gov Registry' }
        ];
      }

      const researchResult = {
        id: 'q_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        query,
        category,
        response: responseText,
        sources
      };

      saveQuery(researchResult);
      res.json(researchResult);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in Development mode. Mounting Vite dev server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in Production mode. Serving built static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LymeWatch full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
