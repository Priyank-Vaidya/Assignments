import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Review from '../../../../models/Review';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    await dbConnect();
    const { rating, reviewText } = await request.json();

    if (!rating || !reviewText) {
      return NextResponse.json({ error: 'Rating and review are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      Analyze this customer review. Rating: ${rating}/5. Review: "${reviewText}".
      
      Return a VALID JSON object with exactly these 3 keys:
      1. "user_response": A polite, empathetic response to the user (max 2 sentences).
      2. "summary": A very brief summary of the feedback (max 10 words).
      3. "action": A recommended internal action for the business.
      
      Do not include Markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

    let aiResult;
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      aiResult = JSON.parse(text);
    } catch (e) {
      console.error("LLM Error:", e);
      aiResult = {
        user_response: "Thank you for your feedback! We have received it.",
        summary: "Processing error",
        action: "Review manually"
      };
    }

    const newReview = await Review.create({
      rating,
      reviewText,
      aiResponse: aiResult.user_response,
      aiSummary: aiResult.summary,
      aiAction: aiResult.action,
    });

    return NextResponse.json({ 
      success: true, 
      message: aiResult.user_response 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}