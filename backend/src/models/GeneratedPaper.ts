import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  number: number;
  text: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  marks: number;
  type: string;
}

export interface ISection {
  id: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAnswerKey {
  questionNumber: number;
  section: string;
  answer: string;
}

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  paperTitle: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  schoolName: string;
  generalInstructions: string[];
  sections: ISection[];
  answerKey: IAnswerKey[];
  validationPassed: boolean;
  repaired: boolean;
  rawOutput: string;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], required: true },
  marks: { type: Number, required: true },
  type: { type: String, required: true },
});

const SectionSchema = new Schema<ISection>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
});

const AnswerKeySchema = new Schema<IAnswerKey>({
  questionNumber: { type: Number, required: true },
  section: { type: String, required: true },
  answer: { type: String, required: true },
});

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    paperTitle: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    schoolName: { type: String, default: 'Delhi Public School' },
    generalInstructions: { type: [String], default: [] },
    sections: { type: [SectionSchema], required: true },
    answerKey: { type: [AnswerKeySchema], default: [] },
    validationPassed: { type: Boolean, default: false },
    repaired: { type: Boolean, default: false },
    rawOutput: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);
