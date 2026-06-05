import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { getRedisConnectionOptions, setJobState } from '../queues/redisConnection';
import { GENERATION_QUEUE_NAME, GenerationJobData } from '../queues/generationQueue';
import { streamGeneration, repairGeneration } from '../services/llmService';
import { validatePaper, parseJSON } from '../services/validationService';
import Assignment from '../models/Assignment';
import GeneratedPaper from '../models/GeneratedPaper';
import {
  emitGenerationStart,
  emitSectionStart,
  emitQuestionReady,
  emitSectionComplete,
  emitValidationStart,
  emitValidationDone,
  emitGenerationDone,
  emitGenerationError,
} from '../socket/socketServer';

let worker: Worker | null = null;

export function startGenerationWorker() {
  worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE_NAME,
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, jobId, form } = job.data;
      console.log(`[Worker] Processing job ${jobId} for assignment ${assignmentId}`);

      try {
        // Update assignment status
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'generating' });
        await setJobState(jobId, { status: 'generating', progress: 0 });

        const totalQuestions = form.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
        emitGenerationStart(jobId, totalQuestions);

        let fullText = '';
        let questionsEmitted = 0;
        const sectionBuffer: Map<string, any> = new Map();
        let parsedSections: any[] = [];

        // Stream the LLM response
        await streamGeneration(form, {
          onChunk: (chunk: string) => {
            fullText += chunk;
          },
          onSection: async (sectionData) => {
            emitSectionStart(jobId, sectionData.id, sectionData.title);
            for (const question of sectionData.questions) {
              await new Promise<void>((resolve) => setTimeout(resolve, 150));
              emitQuestionReady(jobId, sectionData.id, question);
              questionsEmitted++;
              await setJobState(jobId, {
                status: 'generating',
                progress: Math.round((questionsEmitted / totalQuestions) * 100),
              });
            }
            emitSectionComplete(jobId, sectionData.id, sectionData.questions.length);
          },
          onQuestion: async (sectionId: string, question: any) => {},
          onComplete: (text: string) => {
            fullText = text;
          },
          onError: (error: Error) => {
            throw error;
          },
        });

        // Parse the complete JSON
        let paperData: any;
        try {
          paperData = parseJSON(fullText);
        } catch (parseErr) {
          throw new Error(`Failed to parse LLM response: ${parseErr}`);
        }

        // Emit sections progressively now that we have the full parsed data
        if (paperData.sections && Array.isArray(paperData.sections)) {
          for (const section of paperData.sections) {
            emitSectionStart(jobId, section.id, section.title);
            for (const question of section.questions) {
              await new Promise<void>((resolve) => setTimeout(resolve, 100));
              emitQuestionReady(jobId, section.id, question);
            }
            emitSectionComplete(jobId, section.id, section.questions.length);
          }
        }

        // Validation phase
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'validating' });
        emitValidationStart(jobId);

        const expected = {
          questionTypes: form.questionTypes,
          totalMarks: form.totalMarks,
          totalQuestions,
        };

        let validationResult = validatePaper(paperData, expected);
        let repaired = false;

        if (!validationResult.passed) {
          console.log(`[Worker] Validation failed for ${jobId}:`, validationResult.errors);

          // Attempt repair
          try {
            const repairedText = await repairGeneration(fullText, validationResult.errors);
            const repairedData = parseJSON(repairedText);
            validationResult = validatePaper(repairedData, expected);

            if (validationResult.passed || validationResult.errors.length < 2) {
              paperData = repairedData;
              repaired = true;
              console.log(`[Worker] Repair succeeded for ${jobId}`);
            }
          } catch (repairErr) {
            console.error(`[Worker] Repair failed for ${jobId}:`, repairErr);
          }
        }

        emitValidationDone(jobId, validationResult.passed, repaired);

        // Save to MongoDB
        const generatedPaper = await GeneratedPaper.create({
          assignmentId: new mongoose.Types.ObjectId(assignmentId),
          paperTitle: paperData.paperTitle || `${form.subject} - ${form.className}`,
          subject: paperData.subject || form.subject,
          className: paperData.class || form.className,
          timeAllowed: paperData.timeAllowed || `${form.duration} Minutes`,
          maxMarks: paperData.maxMarks || form.totalMarks,
          schoolName: form.schoolName,
          generalInstructions: paperData.generalInstructions || [],
          sections: paperData.sections || [],
          answerKey: paperData.answerKey || [],
          validationPassed: validationResult.passed,
          repaired,
          rawOutput: fullText.slice(0, 5000),
        });

        await Assignment.findByIdAndUpdate(assignmentId, {
          status: 'done',
          paperId: generatedPaper._id,
        });

        await setJobState(jobId, { status: 'done', paperId: generatedPaper._id.toString() });
        emitGenerationDone(jobId, generatedPaper._id.toString());

        console.log(`[Worker] Job ${jobId} completed. Paper ID: ${generatedPaper._id}`);
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : String(error);
        console.error(`[Worker] Job ${jobId} failed:`, errMessage);

        await Assignment.findByIdAndUpdate(assignmentId, { status: 'error' });
        await setJobState(jobId, { status: 'error', error: errMessage });
        emitGenerationError(jobId, errMessage);

        throw error;
      }
    },
    {
      connection: { url: getRedisConnectionOptions().url },
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[Worker] Generation worker started');
  return worker;
}

export function stopGenerationWorker() {
  return worker?.close();
}
