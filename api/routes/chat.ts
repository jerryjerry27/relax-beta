import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    // Initialize Gemini inside handler to ensure env vars are loaded
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Convert history to Gemini format if needed, or start fresh chat
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
