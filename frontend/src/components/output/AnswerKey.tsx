'use client';

import { useState } from 'react';
import { AnswerKeyItem } from '@/stores/assignmentStore';
import styles from './AnswerKey.module.css';

interface AnswerKeyProps {
  answerKey: AnswerKeyItem[];
}

export default function AnswerKey({ answerKey }: AnswerKeyProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (answerKey.length === 0) return null;

  const bySection = answerKey.reduce<Record<string, AnswerKeyItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className={`${styles.answerKey} answer-key-section`} id="answer-key">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.keyIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h3 className={styles.title}>Answer Key</h3>
        </div>
        <button
          className={`${styles.collapseBtn} answer-key-toggle no-print`}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? 'Show' : 'Hide'} Answers
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: '0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className={styles.content}>
          {Object.entries(bySection).sort().map(([section, items]) => (
            <div key={section} className={styles.sectionGroup}>
              <div className={styles.sectionLabel}>Section {section}</div>
              <div className={styles.answerList}>
                {items
                  .sort((a, b) => a.questionNumber - b.questionNumber)
                  .map((item) => (
                    <div key={item.questionNumber} className={styles.answerItem}>
                      <span className={styles.answerNumber}>Q{item.questionNumber}.</span>
                      <p className={styles.answerText}>{item.answer}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
