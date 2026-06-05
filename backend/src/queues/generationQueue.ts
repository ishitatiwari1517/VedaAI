import { Queue } from 'bullmq';
import { getRedisConnectionOptions } from './redisConnection';

export const GENERATION_QUEUE_NAME = 'paper-generation';

let generationQueue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!generationQueue) {
    const { url } = getRedisConnectionOptions();
    generationQueue = new Queue(GENERATION_QUEUE_NAME, {
      connection: { url },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return generationQueue;
}

export interface GenerationJobData {
  assignmentId: string;
  jobId: string;
  form: {
    title: string;
    subject: string;
    className: string;
    duration: number;
    totalMarks: number;
    dueDate: string;
    questionTypes: Array<{ type: string; count: number; marks: number }>;
    additionalInfo: string;
    schoolName: string;
    teacherName: string;
  };
}
