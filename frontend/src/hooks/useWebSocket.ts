'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore, Question, PaperSection } from '@/stores/assignmentStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function useWebSocket(jobId: string | null) {
  const {
    setGenerationStatus,
    setGenerationProgress,
    setValidationStatus,
    setCompletedPaper,
    appendSection,
    appendQuestion,
    clearSections,
    setGenerationError,
    generationProgress,
  } = useAssignmentStore();

  const currentJobId = useRef<string | null>(null);
  const progressRef = useRef({ current: 0, total: 0, currentSection: '' });

  // Keep progressRef in sync
  useEffect(() => {
    progressRef.current = generationProgress;
  }, [generationProgress]);

  const handleJobQueued = useCallback(
    (data: { jobId: string; position: number }) => {
      setGenerationStatus('queued');
      console.log('[WS] Job queued at position:', data.position);
    },
    [setGenerationStatus]
  );

  const handleGenerationStart = useCallback(
    (data: { jobId: string; totalQuestions: number }) => {
      setGenerationStatus('generating');
      clearSections();
      setGenerationProgress({ current: 0, total: data.totalQuestions, currentSection: '' });
      console.log('[WS] Generation started, total questions:', data.totalQuestions);
    },
    [setGenerationStatus, clearSections, setGenerationProgress]
  );

  const handleSectionStart = useCallback(
    (data: { jobId: string; section: string; title: string }) => {
      appendSection({
        id: data.section,
        title: data.title,
        instruction: '',
        questions: [],
      });
      setGenerationProgress({
        ...progressRef.current,
        currentSection: data.title,
      });
      console.log('[WS] Section started:', data.section, data.title);
    },
    [appendSection, setGenerationProgress]
  );

  const handleQuestionReady = useCallback(
    (data: { jobId: string; section: string; question: Question }) => {
      appendQuestion(data.section, data.question);
      setGenerationProgress({
        ...progressRef.current,
        current: progressRef.current.current + 1,
      });
      console.log('[WS] Question ready:', data.section, data.question.number);
    },
    [appendQuestion, setGenerationProgress]
  );

  const handleValidationStart = useCallback(() => {
    setGenerationStatus('validating');
    console.log('[WS] Validation started');
  }, [setGenerationStatus]);

  const handleValidationDone = useCallback(
    (data: { jobId: string; passed: boolean; repaired: boolean }) => {
      setValidationStatus({ passed: data.passed, repaired: data.repaired });
      console.log('[WS] Validation done:', data);
    },
    [setValidationStatus]
  );

  const handleGenerationDone = useCallback(
    async (data: { jobId: string; paperId: string }) => {
      setGenerationStatus('done');
      console.log('[WS] Generation done, paper ID:', data.paperId);

      // Fetch the complete paper
      try {
        const res = await fetch(`${BACKEND_URL}/api/assignments/paper/${data.paperId}`);
        if (res.ok) {
          const paper = await res.json();
          setCompletedPaper(paper);
        }
      } catch (err) {
        console.error('[WS] Failed to fetch completed paper:', err);
      }
    },
    [setGenerationStatus, setCompletedPaper]
  );

  const handleGenerationError = useCallback(
    (data: { jobId: string; message: string }) => {
      setGenerationStatus('error');
      setGenerationError(data.message);
      console.error('[WS] Generation error:', data.message);
    },
    [setGenerationStatus, setGenerationError]
  );

  useEffect(() => {
    if (!jobId) return;

    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log('[WS] Connected, joining room:', jobId);
      socket.emit('join_job_room', { jobId });
    };

    if (socket.connected && currentJobId.current !== jobId) {
      socket.emit('join_job_room', { jobId });
    }

    currentJobId.current = jobId;

    socket.on('connect', onConnect);
    socket.on('job_queued', handleJobQueued);
    socket.on('generation_start', handleGenerationStart);
    socket.on('section_start', handleSectionStart);
    socket.on('question_ready', handleQuestionReady);
    socket.on('section_complete', () => {});
    socket.on('validation_start', handleValidationStart);
    socket.on('validation_done', handleValidationDone);
    socket.on('generation_done', handleGenerationDone);
    socket.on('generation_error', handleGenerationError);

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('job_queued', handleJobQueued);
      socket.off('generation_start', handleGenerationStart);
      socket.off('section_start', handleSectionStart);
      socket.off('question_ready', handleQuestionReady);
      socket.off('validation_start', handleValidationStart);
      socket.off('validation_done', handleValidationDone);
      socket.off('generation_done', handleGenerationDone);
      socket.off('generation_error', handleGenerationError);
    };
  }, [
    jobId,
    handleJobQueued,
    handleGenerationStart,
    handleSectionStart,
    handleQuestionReady,
    handleValidationStart,
    handleValidationDone,
    handleGenerationDone,
    handleGenerationError,
  ]);

  return { socket: socketInstance };
}
