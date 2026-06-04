import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  duration: number;
  totalMarks: number;
  dueDate: string;
  questionTypes: IQuestionType[];
  additionalInfo: string;
  uploadedFile?: string;
  schoolName: string;
  teacherName: string;
  status: 'pending' | 'queued' | 'generating' | 'validating' | 'done' | 'error';
  jobId?: string;
  paperId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    duration: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    dueDate: { type: String, required: true },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInfo: { type: String, default: '' },
    uploadedFile: { type: String },
    schoolName: { type: String, default: 'Delhi Public School' },
    teacherName: { type: String, default: 'John Doe' },
    status: {
      type: String,
      enum: ['pending', 'queued', 'generating', 'validating', 'done', 'error'],
      default: 'pending',
    },
    jobId: { type: String },
    paperId: { type: Schema.Types.ObjectId, ref: 'GeneratedPaper' },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
