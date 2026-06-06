'use client';

import { Question } from '@/stores/assignmentStore';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  index: number; // for stagger animation
  showAnswer?: string;
}

const difficultyConfig = {
  easy: { label: 'Easy', bg: 'var(--color-easy)', text: 'var(--color-easy-text)', border: 'var(--color-easy-border)' },
  moderate: { label: 'Moderate', bg: 'var(--color-moderate)', text: 'var(--color-moderate-text)', border: 'var(--color-moderate-border)' },
  hard: { label: 'Hard', bg: 'var(--color-hard)', text: 'var(--color-hard-text)', border: 'var(--color-hard-border)' },
};

export default function QuestionCard({ question, index, showAnswer }: QuestionCardProps) {
  const diff = difficultyConfig[question.difficulty] || difficultyConfig.moderate;

  return (
    <div
      className={`${styles.questionCard} question-card`}
      style={{ '--question-index': index } as React.CSSProperties}
    >
      <div className={styles.questionRow}>
        {/* Number */}
        <div className={styles.questionNumber}>{question.number}.</div>

        {/* Text + Badges */}
        <div className={styles.questionContent}>
          <p className={styles.questionText}>{question.text}</p>

          <div className={styles.questionMeta}>
            <span
              className={`${styles.diffBadge} difficulty-badge no-print`}
              style={{
                background: diff.bg,
                color: diff.text,
                borderColor: diff.border,
              }}
            >
              {diff.label}
            </span>
            <span className={styles.marksTag}>[{question.marks} {question.marks === 1 ? 'mark' : 'marks'}]</span>
          </div>

          {showAnswer && (
            <div className={styles.answerBlock}>
              <span className={styles.answerLabel}>Answer:</span>
              <p className={styles.answerText}>{showAnswer}</p>
            </div>
          )}
        </div>

        {/* Marks (print-visible) */}
        <div className={styles.questionMarks}>[{question.marks}]</div>
      </div>
    </div>
  );
}
