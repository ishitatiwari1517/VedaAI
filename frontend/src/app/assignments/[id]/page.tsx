'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import GenerationProgress from '@/components/output/GenerationProgress';
import QuestionSection from '@/components/output/QuestionSection';
import AnswerKey from '@/components/output/AnswerKey';
import ExportButton from '@/components/output/ExportButton';
import { useAssignmentStore } from '@/stores/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AssignmentOutputPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const assignmentId = params.id as string;
  const jobId = searchParams.get('jobId');

  const {
    generationStatus,
    generationProgress,
    validationStatus,
    generationError,
    sections,
    completedPaper,
    setCompletedPaper,
    setGenerationStatus,
    setCurrentJobId,
    userSettings,
  } = useAssignmentStore();

  const [assignment, setAssignment] = useState<any>(null);
  const [loadingPaper, setLoadingPaper] = useState(false);

  // Initialize WebSocket
  useWebSocket(jobId);

  useEffect(() => {
    if (jobId) {
      setCurrentJobId(jobId);
    }
  }, [jobId, setCurrentJobId]);

  // Load assignment details
  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const data = await api.getAssignment(assignmentId);
        setAssignment(data);

        // If already done (e.g. page refresh), load the paper
        if (data.status === 'done' && data.paperId && !completedPaper) {
          setLoadingPaper(true);
          try {
            const { paper } = await api.getAssignmentPaper(assignmentId);
            setCompletedPaper(paper);
            setGenerationStatus('done');
          } catch {
            console.error('Failed to load paper');
          } finally {
            setLoadingPaper(false);
          }
        } else if (data.status === 'generating' || data.status === 'queued' || data.status === 'validating') {
          setGenerationStatus(data.status);
        }
      } catch {
        console.error('Assignment not found');
        router.push('/assignments');
      }
    };
    loadAssignment();
  }, [assignmentId, completedPaper, setCompletedPaper, setGenerationStatus, router]);

  // Determine which sections to display
  const displaySections = generationStatus === 'done' && completedPaper
    ? completedPaper.sections
    : sections;

  const displayAnswerKey = generationStatus === 'done' && completedPaper
    ? completedPaper.answerKey
    : [];

  const isStreaming = generationStatus === 'generating' || generationStatus === 'queued';

  const paperMeta = completedPaper || (assignment ? {
    paperTitle: assignment.title,
    subject: assignment.subject,
    className: assignment.className,
    timeAllowed: `${assignment.duration} Minutes`,
    maxMarks: assignment.totalMarks,
    schoolName: assignment?.schoolName || userSettings.schoolName,
    generalInstructions: ['All questions are compulsory unless stated otherwise.'],
  } : null);

  const totalQ = generationProgress.total || (assignment?.questionTypes?.reduce((s: number, qt: any) => s + qt.count, 0) ?? 0);

  return (
    <div className={styles.layout}>
      <Sidebar />

      <div className={styles.main}>
        <TopBar />

        {/* Action Bar */}
        <div className={`${styles.actionBar} action-bar no-print`}>
          <Link href="/assignments" className={styles.backBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </Link>

          <div className={styles.actionRight}>
            {generationStatus === 'done' && validationStatus && (
              <div className={`${styles.validationBadge} ${validationStatus.passed ? styles.validBadge : styles.warnBadge}`}>
                {validationStatus.passed ? (
                  <>✓ Quality validated{validationStatus.repaired ? ' (auto-repaired)' : ''}</>
                ) : (
                  <>⚠ Partial validation</>
                )}
              </div>
            )}
            {generationStatus === 'done' && completedPaper && (
              <ExportButton paperTitle={completedPaper.paperTitle} />
            )}
          </div>
        </div>

        <div className={styles.content}>
          {/* Generation Progress */}
          {(generationStatus !== 'idle' && generationStatus !== 'done') && (
            <GenerationProgress
              status={generationStatus}
              progress={generationProgress}
              validationStatus={validationStatus}
              error={generationError}
            />
          )}

          {/* Paper */}
          {(displaySections.length > 0 || paperMeta) && (
            <div className={`${styles.paper} paper-main print-container`} id="question-paper">
              {/* School Header */}
              {paperMeta && (
                <div className={`${styles.paperHeader} paper-school-header`}>
                  <div className={styles.schoolLogo}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div className={styles.schoolName}>{paperMeta.schoolName}</div>
                  <div className={styles.paperTitle}>{paperMeta.paperTitle}</div>

                  <div className={`${styles.paperMetaGrid} paper-meta`}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Subject</span>
                      <span className={styles.metaValue}>{paperMeta.subject}</span>
                    </div>
                    <div className={styles.metaDivider} />
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Class</span>
                      <span className={styles.metaValue}>{paperMeta.className}</span>
                    </div>
                    <div className={styles.metaDivider} />
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Time Allowed</span>
                      <span className={styles.metaValue}>{paperMeta.timeAllowed}</span>
                    </div>
                    <div className={styles.metaDivider} />
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Maximum Marks</span>
                      <span className={styles.metaValue}>{paperMeta.maxMarks}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* General Instructions */}
              {paperMeta && (paperMeta.generalInstructions?.length ?? 0) > 0 && (
                <div className={styles.instructions}>
                  {(paperMeta.generalInstructions ?? []).map((inst: string, i: number) => (
                    <p key={i} className={styles.instruction}>
                      {i === 0 ? <strong>{inst}</strong> : inst}
                    </p>
                  ))}
                </div>
              )}

              {/* Student Info Lines */}
              <div className={styles.studentInfo}>
                <div className={styles.infoLine}>
                  Name: <span className={styles.underline} />
                </div>
                <div className={styles.infoLine}>
                  Roll Number: <span className={styles.underline} />
                </div>
                <div className={styles.infoLine}>
                  Class/Section: <span className={styles.underline} />
                </div>
              </div>

              {/* Sections */}
              <div className={styles.sections}>
                {displaySections.length === 0 && generationStatus !== 'idle' ? (
                  <div className={styles.waitingMessage}>
                    <div className={styles.waitDots}>
                      <span className={styles.waitDot} style={{ animationDelay: '0ms' }} />
                      <span className={styles.waitDot} style={{ animationDelay: '200ms' }} />
                      <span className={styles.waitDot} style={{ animationDelay: '400ms' }} />
                    </div>
                    <p>Waiting for first question...</p>
                  </div>
                ) : (
                  displaySections.map((section, i) => (
                    <QuestionSection
                      key={section.id}
                      section={section}
                      sectionIndex={i}
                      answerKey={displayAnswerKey}
                      showAnswers={false}
                      isStreaming={isStreaming}
                    />
                  ))
                )}
              </div>

              {/* End of paper divider */}
              {generationStatus === 'done' && displaySections.length > 0 && (
                <div className={styles.endDivider}>
                  <div className={styles.endLine} />
                  <span className={styles.endText}>End of Question Paper</span>
                  <div className={styles.endLine} />
                </div>
              )}

              {/* Answer Key */}
              {generationStatus === 'done' && displayAnswerKey.length > 0 && (
                <AnswerKey answerKey={displayAnswerKey} />
              )}
            </div>
          )}

          {/* Error State */}
          {generationStatus === 'error' && (
            <div className={styles.errorState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#EF4444' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3>Generation Failed</h3>
              <p>{generationError || 'Something went wrong. Please try again.'}</p>
              <Link href="/assignments/create" className={styles.retryBtn}>Try Again</Link>
            </div>
          )}

          {/* Loading existing paper */}
          {loadingPaper && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Loading paper...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
