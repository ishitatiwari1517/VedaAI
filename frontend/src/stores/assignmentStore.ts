import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ========== Types ==========

export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentForm {
  title: string;
  subject: string;
  className: string;
  duration: number;
  totalMarks: number;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInfo: string;
  schoolName: string;
  teacherName: string;
}

export interface Question {
  number: number;
  text: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  marks: number;
  type: string;
}

export interface PaperSection {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  questionNumber: number;
  section: string;
  answer: string;
}

export interface GeneratedPaper {
  _id: string;
  paperTitle: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  schoolName: string;
  generalInstructions: string[];
  sections: PaperSection[];
  answerKey: AnswerKeyItem[];
  validationPassed: boolean;
  repaired: boolean;
  createdAt: string;
}

export type GenerationStatus =
  | 'idle'
  | 'queued'
  | 'generating'
  | 'validating'
  | 'done'
  | 'error';

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  duration: number;
  totalMarks: number;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInfo: string;
  schoolName: string;
  teacherName: string;
  status: GenerationStatus;
  jobId?: string;
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Store Interface ==========

interface AssignmentStore {
  // Form state
  form: AssignmentForm;
  formStep: number;
  updateForm: (updates: Partial<AssignmentForm>) => void;
  setStep: (step: number) => void;
  resetForm: () => void;

  // Generation state
  generationStatus: GenerationStatus;
  generationProgress: { current: number; total: number; currentSection: string };
  currentJobId: string | null;
  currentAssignmentId: string | null;
  validationStatus: { passed: boolean; repaired: boolean } | null;
  generationError: string | null;

  setGenerationStatus: (status: GenerationStatus) => void;
  setGenerationProgress: (progress: { current: number; total: number; currentSection: string }) => void;
  setCurrentJobId: (jobId: string | null) => void;
  setCurrentAssignmentId: (id: string | null) => void;
  setValidationStatus: (status: { passed: boolean; repaired: boolean } | null) => void;
  setGenerationError: (error: string | null) => void;
  incrementProgress: (sectionName: string) => void;

  // Paper state — built incrementally as WebSocket events arrive
  sections: PaperSection[];
  appendSection: (section: Omit<PaperSection, 'questions'> & { questions?: Question[] }) => void;
  appendQuestion: (sectionId: string, question: Question) => void;
  clearSections: () => void;

  // Final paper
  completedPaper: GeneratedPaper | null;
  setCompletedPaper: (paper: GeneratedPaper) => void;

  // Assignments list
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;

  // Settings
  userSettings: { schoolName: string; schoolCity: string; userName: string; userEmail: string };
  updateUserSettings: (updates: Partial<AssignmentStore['userSettings']>) => void;
}

// ========== Default Form ==========

const defaultForm: AssignmentForm = {
  title: '',
  subject: '',
  className: '',
  duration: 60,
  totalMarks: 60,
  dueDate: '',
  questionTypes: [
    { type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { type: 'Short Questions', count: 3, marks: 2 },
    { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { type: 'Numerical Problems', count: 5, marks: 5 },
  ],
  additionalInfo: '',
  schoolName: 'Delhi Public School',
  teacherName: 'John Doe',
};

// ========== Store ==========

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    persist(
      (set) => ({
      // Form
      form: { ...defaultForm },
      formStep: 0,
      updateForm: (updates) =>
        set((state) => ({ form: { ...state.form, ...updates } })),
      setStep: (step) => set({ formStep: step }),
      resetForm: () => set({ form: { ...defaultForm }, formStep: 0 }),

      // Generation
      generationStatus: 'idle',
      generationProgress: { current: 0, total: 0, currentSection: '' },
      currentJobId: null,
      currentAssignmentId: null,
      validationStatus: null,
      generationError: null,

      setGenerationStatus: (status) => set({ generationStatus: status }),
      setGenerationProgress: (progress) => set({ generationProgress: progress }),
      setCurrentJobId: (jobId) => set({ currentJobId: jobId }),
      setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),
      setValidationStatus: (status) => set({ validationStatus: status }),
      setGenerationError: (error) => set({ generationError: error }),
      incrementProgress: (sectionName) =>
        set((state) => ({
          generationProgress: {
            ...state.generationProgress,
            current: state.generationProgress.current + 1,
            currentSection: sectionName,
          },
        })),

      // Paper sections (incremental)
      sections: [],
      appendSection: (section) =>
        set((state) => {
          const exists = state.sections.find((s) => s.id === section.id);
          if (exists) return state;
          return {
            sections: [
              ...state.sections,
              { ...section, questions: section.questions || [] },
            ],
          };
        }),
      appendQuestion: (sectionId, question) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: [
                    ...section.questions.filter((q) => q.number !== question.number),
                    question,
                  ],
                }
              : section
          ),
        })),
      clearSections: () => set({ sections: [] }),

      // Final paper
      completedPaper: null,
      setCompletedPaper: (paper) => set({ completedPaper: paper }),

      // Assignments list
      assignments: [],
      setAssignments: (assignments) => set({ assignments }),
      addAssignment: (assignment) =>
        set((state) => ({ assignments: [assignment, ...state.assignments] })),
      removeAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a._id !== id),
        })),

      // User Settings
      userSettings: {
        schoolName: 'Delhi Public School',
        schoolCity: 'Bokaro Steel City',
        userName: 'John Doe',
        userEmail: 'johndoe@delhipublicschool.edu',
      },
      updateUserSettings: (updates) =>
        set((state) => ({
          userSettings: { ...state.userSettings, ...updates },
        })),
    }),
    { name: 'vedaai-assignment-store-persist' }
    ),
    { name: 'vedaai-assignment-store' }
  )
);
