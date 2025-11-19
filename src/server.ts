import 'dotenv/config';
import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

const upload = multer({ storage: multer.memoryStorage() });

// Initialize AI clients
const googleAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const deepseekAI = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

type AIProvider = 'google' | 'openai' | 'deepseek';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Google GenAI Showcase API',
      version: '1.0.0',
      description: 'Eine einfache API für Google GenAI Integration mit Text-, Bild- und PDF-Analyse',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        TextRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: {
              type: 'string',
              description: 'Der zu analysierende Text'
            }
          }
        },
        FileRequest: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'Optional: Spezifische Frage zur Datei'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            response: {
              type: 'string',
              description: 'Die KI-Antwort'
            },
            error: {
              type: 'string',
              description: 'Fehlermeldung falls ein Fehler aufgetreten ist'
            }
          }
        }
      }
    }
  },
  apis: ['./src/server.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

interface TextRequest {
  text: string;
  provider?: AIProvider;
}

interface ApiResponse {
  response?: string;
  error?: string;
}

/**
 * @swagger
 * /api/text:
 *   post:
 *     summary: Analysiert einen Text mit Google GenAI
 *     tags: [Text Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TextRequest'
 *     responses:
 *       200:
 *         description: Erfolgreiche Textanalyse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Ungültige Anfrage
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.post('/api/text', async (req: Request<{}, ApiResponse, TextRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { text, provider = 'google' } = req.body;
    
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    let result: string;
    
    switch (provider) {
      case 'openai':
        result = await processTextWithOpenAI(text);
        break;
      case 'deepseek':
        result = await processTextWithDeepSeek(text);
        break;
      case 'google':
      default:
        result = await processTextWithGoogle(text);
        break;
    }

    res.json({ response: result });
    return;
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

interface FileRequest {
  question?: string;
  provider?: AIProvider;
}

// AI Processing Functions
async function processTextWithGoogle(text: string): Promise<string> {
  const config = {
    responseMimeType: 'application/json',
  };
  const model = 'gemini-2.0-flash';
  const contents = [
    {
      role: 'user' as const,
      parts: [{ text }],
    },
  ];

  const response = await googleAI.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = '';
  for await (const chunk of response) {
    result += chunk.text;
  }
  return result;
}

async function processTextWithOpenAI(text: string): Promise<string> {
  const response = await openAI.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { 
        role: 'system', 
        content: 'You must respond with valid JSON format. Structure your response as a JSON object with relevant fields.' 
      },
      { role: 'user', content: text }
    ],
  });

  return response.choices[0]?.message?.content || '';
}

async function processTextWithDeepSeek(text: string): Promise<string> {
  const response = await deepseekAI.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { 
        role: 'system', 
        content: 'You must respond with valid JSON format. Structure your response as a JSON object with relevant fields.' 
      },
      { role: 'user', content: text }
    ],
  });

  return response.choices[0]?.message?.content || '';
}

async function processImageWithGoogle(base64Data: string, mimeType: string, question: string): Promise<string> {
  const config = {
    responseMimeType: 'application/json',
  };
  const model = 'gemini-2.0-flash';
  const contents = [
    {
      role: 'user' as const,
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
        { text: question },
      ],
    },
  ];

  const response = await googleAI.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = '';
  for await (const chunk of response) {
    result += chunk.text;
  }
  return result;
}

async function processImageWithOpenAI(base64Data: string, mimeType: string, question: string): Promise<string> {
  const response = await openAI.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You must respond with valid JSON format. Structure your response as a JSON object with relevant fields.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: question },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0]?.message?.content || '';
}

async function processImageWithDeepSeek(base64Data: string, mimeType: string, question: string): Promise<string> {
  // DeepSeek currently doesn't support vision, return error message
  return JSON.stringify({ error: 'DeepSeek does not currently support image analysis' });
}

/**
 * @swagger
 * /api/image:
 *   post:
 *     summary: Analysiert ein Bild mit Google GenAI
 *     tags: [Image Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Die Bilddatei zur Analyse
 *               question:
 *                 type: string
 *                 description: Optional - Spezifische Frage zum Bild
 *             required:
 *               - image
 *     responses:
 *       200:
 *         description: Erfolgreiche Bildanalyse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Ungültige Anfrage oder Dateiformat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.post('/api/image', upload.single('image'), async (req: Request<{}, ApiResponse, FileRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { question, provider = 'google' } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    if (!file.mimetype.startsWith('image/')) {
      res.status(400).json({ error: 'File must be an image' });
      return;
    }

    const base64Data = file.buffer.toString('base64');
    const questionText = question || 'What are you seeing in this picture?';

    let result: string;
    
    switch (provider) {
      case 'openai':
        result = await processImageWithOpenAI(base64Data, file.mimetype, questionText);
        break;
      case 'deepseek':
        result = await processImageWithDeepSeek(base64Data, file.mimetype, questionText);
        break;
      case 'google':
      default:
        result = await processImageWithGoogle(base64Data, file.mimetype, questionText);
        break;
    }

    res.json({ response: result });
    return;
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

/**
 * @swagger
 * /api/pdf:
 *   post:
 *     summary: Analysiert ein PDF-Dokument mit Google GenAI
 *     tags: [PDF Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: Die PDF-Datei zur Analyse
 *               question:
 *                 type: string
 *                 description: Optional - Spezifische Frage zum PDF
 *             required:
 *               - pdf
 *     responses:
 *       200:
 *         description: Erfolgreiche PDF-Analyse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Ungültige Anfrage oder Dateiformat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
app.post('/api/pdf', upload.single('pdf'), async (req: Request<{}, ApiResponse, FileRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { question, provider = 'google' } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'PDF file is required' });
      return;
    }

    if (file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'File must be a PDF' });
      return;
    }

    const base64Data = file.buffer.toString('base64');
    const questionText = question || 'What are you seeing in this PDF?';

    let result: string;
    
    switch (provider) {
      case 'openai':
      case 'deepseek':
        // OpenAI and DeepSeek don't support PDF analysis directly
        result = JSON.stringify({ error: `${provider} does not currently support PDF analysis` });
        break;
      case 'google':
      default:
        const config = {
          responseMimeType: 'application/json',
        };
        const model = 'gemini-2.0-flash';
        const contents = [
          {
            role: 'user' as const,
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'application/pdf',
                },
              },
              {
                text: questionText,
              },
            ],
          },
        ];

        const response = await googleAI.models.generateContentStream({
          model,
          config,
          contents,
        });

        result = '';
        for await (const chunk of response) {
          result += chunk.text;
        }
        break;
    }

    res.json({ response: result });
    return;
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Zeigt die Hauptseite der Anwendung
 *     tags: [Frontend]
 *     responses:
 *       200:
 *         description: HTML-Seite der Anwendung
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
app.get('/', (req: Request, res: Response) => {
  res.sendFile(join(__dirname, '../public', 'index.html'));
});

const httpsKeyPath = process.env.HTTPS_KEY_PATH || join(__dirname, '../server.key');
const httpsCertPath = process.env.HTTPS_CERT_PATH || join(__dirname, '../server.crt');

console.log('process.env.HTTPS_KEY_PATH:', process.env.HTTPS_KEY_PATH);
console.log('process.env.HTTPS_CERT_PATH:', process.env.HTTPS_CERT_PATH);
console.log('Resolved HTTPS_KEY_PATH:', httpsKeyPath);
console.log('Resolved HTTPS_CERT_PATH:', httpsCertPath);
console.log('Key file exists:', fs.existsSync(httpsKeyPath));
console.log('Cert file exists:', fs.existsSync(httpsCertPath));

let httpsOptions: { key: Buffer; cert: Buffer } | null = null;
try {
  httpsOptions = {
    key: fs.readFileSync(httpsKeyPath),
    cert: fs.readFileSync(httpsCertPath),
  };
} catch (err) {
  console.warn('Could not read HTTPS certificate files. HTTPS will not be enabled.');
  httpsOptions = null;
}

// HTTP server (kept for redirect and local/dev)
app.listen(port, () => {
  console.log(`HTTP server running on http://localhost:${port}`);
});

// If HTTPS options are available, start HTTPS server
if (httpsOptions) {
  const httpsPort = 443;
  // Redirect all HTTP requests to HTTPS
  app.use((req, res, next) => {
    if (req.protocol === 'http') {
      const host = req.headers.host?.replace(/:\d+$/, ':443') || '';
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
    next();
  });
  https.createServer(httpsOptions, app).listen(httpsPort, () => {
    console.log(`HTTPS server running on https://localhost:${httpsPort}`);
  });
}