'use client';

import { PaperSection, AnswerKeyItem } from '@/stores/assignmentStore';
import QuestionCard from './QuestionCard';
import styles from './QuestionSection.module.css';

interface QuestionSectionProps {
  section: PaperSection;
  sectionIndex: number;
  answerKey?: AnswerKeyItem[];
  showAnswers?: boolean;
  isStreaming?: boolean;
}

export default function QuestionSection({
  section,
  sectionIndex,
  answerKey = [],
  showAnswers = false,
  isStreaming = false,
}: QuestionSectionProps) {
  const getAnswer = (questionNumber: number): string | undefined => {
    return answerKey.find(
      (a) => a.questionNumber === questionNumber && a.section === section.id
    )?.answer;
  };

  const sortedQuestions = [...section.questions].sort((a, b) => a.number - b.number);

  return (
    <div className={`${styles.section} paper-section section-header-anim`}>
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleRow}>
          <div className={styles.sectionId}>Section {section.id}</div>
          <h3 className={styles.sectionTitle}>{section.title}</h3>
          {isStreaming && (
            <span className={styles.streamingChip}>
              <span className={styles.streamDot} />
              Live
            </span>
          )}
        </div>
        {section.instruction && (
          <p className={styles.instruction}>{section.instruction}</p>
        )}
      </div>

      {/* Questions */}
      <div className={styles.questions}>
        {sortedQuestions.length === 0 ? (
          <div className={styles.skeletonWrapper}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          sortedQuestions.map((question, qIdx) => (
            <QuestionCard
              key={question.number}
              question={question}
              index={sectionIndex * 10 + qIdx}
              showAnswer={showAnswers ? getAnswer(question.number) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
