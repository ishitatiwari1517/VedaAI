import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationJobData } from '../queues/generationQueue';

// Use the GEMINI_API_KEY from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const buildSystemPrompt = () => `
You are an expert Indian school examination paper setter with 20 years of experience.
You always generate questions that are pedagogically sound, age-appropriate, and follow CBSE/ICSE patterns.
You respond ONLY in valid JSON. No markdown, no preamble, no explanation outside the JSON.
All questions must be relevant, educational, and appropriate for the specified class level.
`;

export const buildUserPrompt = (data: GenerationJobData['form']) => `
Generate a complete question paper with the following specifications:

School: ${data.schoolName}
Subject: ${data.subject}
Class: ${data.className}
Total Marks: ${data.totalMarks}
Time Allowed: ${data.duration} minutes
Due Date: ${data.dueDate}
Additional Instructions: ${data.additionalInfo || 'None'}

Question Types Required:
${data.questionTypes.map(qt => `- ${qt.type}: ${qt.count} questions × ${qt.marks} marks each`).join('\n')}

Total Questions: ${data.questionTypes.reduce((sum, qt) => sum + qt.count, 0)}
Total Marks Check: ${data.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0)}

Return ONLY this exact JSON structure with NO additional text:
{
  "paperTitle": "string - descriptive exam title",
  "subject": "${data.subject}",
  "class": "${data.className}",
  "timeAllowed": "${data.duration} Minutes",
  "maxMarks": ${data.totalMarks},
  "generalInstructions": [
    "All questions are compulsory unless stated otherwise.",
    "Write neatly and legibly.",
    "Marks are indicated against each question."
  ],
  "sections": [
    {
      "id": "A",
      "title": "Section title matching question type",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "questions": [
        {
          "number": 1,
          "text": "Full question text here",
          "difficulty": "easy",
          "marks": ${data.questionTypes[0]?.marks || 1},
          "type": "question type string"
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionNumber": 1,
      "section": "A",
      "answer": "Complete answer text"
    }
  ]
}

CRITICAL RULES:
1. Generate EXACTLY the number of questions specified for each type
2. Total marks MUST equal ${data.totalMarks}
3. Every question MUST have difficulty: "easy", "moderate", or "hard"
4. answerKey must have an entry for EVERY question
5. Each section maps to one question type
6. Section IDs are alphabetical: A, B, C, D...
`;

export interface LLMStreamCallbacks {
  onChunk: (chunk: string) => void;
  onSection: (sectionData: { id: string; title: string; instruction: string; questions: any[] }) => Promise<void>;
  onQuestion: (sectionId: string, question: any) => Promise<void>;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

export async function streamGeneration(
  data: GenerationJobData['form'],
  callbacks: LLMStreamCallbacks
): Promise<string> {
  let fullText = '';

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    
    // For Gemini, we combine the system prompt and user prompt into one message
    const combinedPrompt = buildSystemPrompt() + '\n\n' + buildUserPrompt(data);

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      callbacks.onChunk(text);
    }

    callbacks.onComplete(fullText);
    return fullText;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    callbacks.onError(err);
    throw err;
  }
}

export async function repairGeneration(
  originalPaper: string,
  errors: string[]
): Promise<string> {
  const repairPrompt = `
The question paper you generated has the following issues:
${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Original paper JSON:
${originalPaper}

Please return ONLY the corrected complete paper in the same JSON format. 
Fix ONLY the mentioned issues. Do not change anything else.
Respond with ONLY valid JSON, no other text.
`;

  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  const combinedPrompt = buildSystemPrompt() + '\n\n' + repairPrompt;
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }]
  });

  return result.response.text();
}
