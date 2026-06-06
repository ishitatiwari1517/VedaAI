'use client';

import { useEffect, useState } from 'react';
import styles from './GenerationProgress.module.css';
import { GenerationStatus } from '@/stores/assignmentStore';

interface GenerationProgressProps {
  status: GenerationStatus;
  progress: { current: number; total: number; currentSection: string };
  validationStatus: { passed: boolean; repaired: boolean } | null;
  error: string | null;
}

export default function GenerationProgress({
  status,
  progress,
  validationStatus,
  error,
}: GenerationProgressProps) {
  const [logs, setLogs] = useState<{ id: string; text: string; status: 'done' | 'active' }[]>([]);

  useEffect(() => {
    const newLogs: typeof logs = [];
    newLogs.push({ id: '1', text: 'Assignment created', status: 'done' });
    
    if (status === 'queued' || status === 'generating' || status === 'validating' || status === 'done') {
      newLogs.push({ id: '2', text: 'Job queued', status: 'done' });
    }
    
    if (status === 'generating') {
      newLogs.push({ id: '3', text: 'Generating questions...', status: 'active' });
    } else if (status === 'validating' || status === 'done') {
      newLogs.push({ id: '3', text: 'Generating questions...', status: 'done' });
    }
    
    if (status === 'validating') {
      newLogs.push({ id: '4', text: 'Validating output quality...', status: 'active' });
    } else if (status === 'done') {
      newLogs.push({ id: '4', text: 'Validating output quality...', status: 'done' });
      newLogs.push({ id: '5', text: 'Paper ready!', status: 'done' });
    }

    if (status === 'error') {
      newLogs.push({ id: 'err', text: `Failed: ${error}`, status: 'active' });
    }

    setLogs(newLogs);
  }, [status, error]);

  if (status === 'idle' || status === 'done') return null;

  const percentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className={`${styles.wrapper} no-print`}>
      <div className={styles.container}>
        {/* Animated icon */}
        <div className={styles.iconContainer}>
          <svg className={styles.pulseIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="4" fill="var(--color-primary-light)" />
          </svg>
        </div>

        <h2 className={styles.title}>Generating your question paper...</h2>
        <p className={styles.subtitle}>This usually takes 15-20 seconds</p>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBarWrapper}>
            <div 
              className={`${styles.progressBarFill} ${progress.total === 0 ? styles.indeterminate : ''}`} 
              style={{ width: progress.total > 0 ? `${percentage}%` : '30%' }} 
            />
          </div>
          <div className={styles.progressText}>
            {progress.currentSection ? `Generating ${progress.currentSection}...` : 'Initializing...'} 
            <span className={styles.progressCount}>({progress.current} of {progress.total || '?'} questions ready)</span>
          </div>
        </div>

        {/* Logs */}
        <div className={styles.logsContainer}>
          {logs.map(log => (
            <div key={log.id} className={styles.logItem}>
              {log.status === 'done' ? (
                <span className={styles.logCheck}>✓</span>
              ) : (
                <span className={styles.logSpin}>⟳</span>
              )}
              <span className={log.status === 'done' ? styles.logTextDone : styles.logTextActive}>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
