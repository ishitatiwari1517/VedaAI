'use client';

import styles from './MarksValidator.module.css';

interface MarksValidatorProps {
  calculatedMarks: number;
  targetMarks: number;
  totalQuestions: number;
}

export default function MarksValidator({ calculatedMarks, targetMarks, totalQuestions }: MarksValidatorProps) {
  const diff = calculatedMarks - targetMarks;
  const matches = diff === 0;

  return (
    <div className={`${styles.validator} ${matches ? styles.validatorOk : styles.validatorWarn}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {matches ? (
          <polyline points="20 6 9 17 4 12" />
        ) : (
          <>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </>
        )}
      </svg>
      <span>
        {matches
          ? `✓ ${totalQuestions} Qs · ${calculatedMarks} marks match target`
          : `⚠ Total marks (${calculatedMarks}) ${diff > 0 ? 'exceeds' : 'below'} target (${targetMarks}) by ${Math.abs(diff)}`}
      </span>
    </div>
  );
}
