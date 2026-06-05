import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('join_job_room', ({ jobId }: { jobId: string }) => {
      socket.join(jobId);
      console.log(`[Socket] Client ${socket.id} joined room: ${jobId}`);
      socket.emit('room_joined', { jobId, status: 'connected' });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// Typed emit helpers
export function emitJobQueued(jobId: string, position: number) {
  getIO().to(jobId).emit('job_queued', { jobId, position });
}

export function emitGenerationStart(jobId: string, totalQuestions: number) {
  getIO().to(jobId).emit('generation_start', { jobId, totalQuestions });
}

export function emitSectionStart(jobId: string, section: string, title: string) {
  getIO().to(jobId).emit('section_start', { jobId, section, title });
}

export function emitQuestionReady(jobId: string, section: string, question: object) {
  getIO().to(jobId).emit('question_ready', { jobId, section, question });
}

export function emitSectionComplete(jobId: string, section: string, questionCount: number) {
  getIO().to(jobId).emit('section_complete', { jobId, section, questionCount });
}

export function emitValidationStart(jobId: string) {
  getIO().to(jobId).emit('validation_start', { jobId });
}

export function emitValidationDone(jobId: string, passed: boolean, repaired: boolean) {
  getIO().to(jobId).emit('validation_done', { jobId, passed, repaired });
}

export function emitGenerationDone(jobId: string, paperId: string) {
  getIO().to(jobId).emit('generation_done', { jobId, paperId });
}

export function emitGenerationError(jobId: string, message: string) {
  getIO().to(jobId).emit('generation_error', { jobId, message });
}
