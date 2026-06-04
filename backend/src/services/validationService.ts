import { IGeneratedPaper, ISection } from '../models/GeneratedPaper';

export interface ValidationResult {
  totalQuestionsMatch: boolean;
  totalMarksMatch: boolean;
  allSectionsPresent: boolean;
  allDifficultyTagged: boolean;
  answerKeyPresent: boolean;
  passed: boolean;
  errors: string[];
}

interface ExpectedConfig {
  questionTypes: Array<{ type: string; count: number; marks: number }>;
  totalMarks: number;
  totalQuestions: number;
}

export function validatePaper(
  paper: Partial<IGeneratedPaper>,
  expected: ExpectedConfig
): ValidationResult {
  const errors: string[] = [];

  // Count actual questions
  const actualQuestions = paper.sections?.reduce(
    (sum, section) => sum + section.questions.length,
    0
  ) ?? 0;

  // Count actual marks
  const actualMarks = paper.sections?.reduce(
    (sectionSum, section) =>
      sectionSum +
      section.questions.reduce((qSum, q) => qSum + (q.marks || 0), 0),
    0
  ) ?? 0;

  // Check total questions
  const totalQuestionsMatch = actualQuestions === expected.totalQuestions;
  if (!totalQuestionsMatch) {
    errors.push(
      `Expected ${expected.totalQuestions} questions but got ${actualQuestions}`
    );
  }

  // Check total marks
  const totalMarksMatch = actualMarks === expected.totalMarks;
  if (!totalMarksMatch) {
    errors.push(
      `Expected total marks of ${expected.totalMarks} but calculated ${actualMarks}`
    );
  }

  // Check all sections present (one per question type)
  const sectionCount = paper.sections?.length ?? 0;
  const allSectionsPresent = sectionCount === expected.questionTypes.length;
  if (!allSectionsPresent) {
    errors.push(
      `Expected ${expected.questionTypes.length} sections but got ${sectionCount}`
    );
  }

  // Check all questions have difficulty tags
  const untagged: number[] = [];
  paper.sections?.forEach((section) => {
    section.questions.forEach((q) => {
      if (!['easy', 'moderate', 'hard'].includes(q.difficulty)) {
        untagged.push(q.number);
      }
    });
  });
  const allDifficultyTagged = untagged.length === 0;
  if (!allDifficultyTagged) {
    errors.push(
      `Questions without difficulty tags: ${untagged.join(', ')}`
    );
  }

  // Check answer key
  const answerCount = paper.answerKey?.length ?? 0;
  const answerKeyPresent = answerCount >= actualQuestions;
  if (!answerKeyPresent) {
    errors.push(
      `Answer key has ${answerCount} entries but paper has ${actualQuestions} questions`
    );
  }

  return {
    totalQuestionsMatch,
    totalMarksMatch,
    allSectionsPresent,
    allDifficultyTagged,
    answerKeyPresent,
    passed: errors.length === 0,
    errors,
  };
}

export function parseJSON(text: string): any {
  // Strip markdown code blocks if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  cleaned = cleaned.trim();

  // Find first { and last } to extract JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No valid JSON object found in response');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}
