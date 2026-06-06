'use client';

import { QuestionType } from '@/stores/assignmentStore';
import styles from './QuestionTypeRow.module.css';

interface QuestionTypeRowProps {
  index: number;
  questionType: QuestionType;
  availableTypes: string[];
  usedTypes: string[];
  onChange: (updated: QuestionType) => void;
  onRemove: () => void;
  canRemove: boolean;
  typeError?: string;
}

export default function QuestionTypeRow({
  index, questionType, availableTypes, usedTypes,
  onChange, onRemove, canRemove, typeError,
}: QuestionTypeRowProps) {
  return (
    <div className={`${styles.row} ${typeError ? styles.rowErr : ''}`}>
      {/* Dropdown */}
      <div className={styles.typeCell}>
        <select
          className={`${styles.select} ${typeError ? styles.selectErr : ''}`}
          value={questionType.type}
          onChange={e => onChange({ ...questionType, type: e.target.value })}
          id={`qt-type-${index}`}
        >
          {availableTypes.map(t => (
            <option key={t} value={t} disabled={usedTypes.includes(t)}>
              {t}
            </option>
          ))}
        </select>
        {typeError && <span className={styles.err}>{typeError}</span>}
      </div>

      {/* Count stepper */}
      <div className={styles.stepper}>
        <button type="button" className={styles.stepBtn}
          onClick={() => onChange({ ...questionType, count: Math.max(1, questionType.count - 1) })}
          aria-label="Decrease count">−</button>
        <span className={styles.stepVal}>{questionType.count}</span>
        <button type="button" className={styles.stepBtn}
          onClick={() => onChange({ ...questionType, count: questionType.count + 1 })}
          aria-label="Increase count">+</button>
      </div>

      {/* Marks stepper */}
      <div className={styles.stepper}>
        <button type="button" className={styles.stepBtn}
          onClick={() => onChange({ ...questionType, marks: Math.max(1, questionType.marks - 1) })}
          aria-label="Decrease marks">−</button>
        <span className={styles.stepVal}>{questionType.marks}</span>
        <button type="button" className={styles.stepBtn}
          onClick={() => onChange({ ...questionType, marks: questionType.marks + 1 })}
          aria-label="Increase marks">+</button>
      </div>

      {/* Remove */}
      <button
        type="button"
        className={`${styles.removeBtn} ${!canRemove ? styles.removeBtnDisabled : ''}`}
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove question type"
      >
        ✕
      </button>
    </div>
  );
}
