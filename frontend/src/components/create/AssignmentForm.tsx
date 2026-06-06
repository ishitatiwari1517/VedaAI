'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssignmentStore, QuestionType } from '@/stores/assignmentStore';
import { api } from '@/lib/api';
import QuestionTypeRow from './QuestionTypeRow';
import styles from './AssignmentForm.module.css';

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
  'Fill in the Blanks',
  'True or False',
  'Match the Following',
  'Essay Type Questions',
  'Case Study Based Questions',
];

const CLASS_OPTIONS = [
  'Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12',
];

const SUBJECT_OPTIONS = [
  'Mathematics','Science','Physics','Chemistry','Biology',
  'English','Hindi','Social Studies','History','Geography',
  'Economics','Computer Science','Accountancy',
];

export default function AssignmentForm() {
  const router = useRouter();
  const {
    form, updateForm,
    setCurrentJobId, setCurrentAssignmentId, setGenerationStatus,
    userSettings
  } = useAssignmentStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalQuestions = form.questionTypes.reduce((s, qt) => s + qt.count, 0);
  const totalMarks = form.questionTypes.reduce((s, qt) => s + qt.count * qt.marks, 0);
  const marksOk = totalMarks === form.totalMarks;

  /* ── Validation ──────────────────────── */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())    e.title    = 'Assignment title is required';
    if (!form.subject)         e.subject  = 'Subject is required';
    if (!form.className)       e.className = 'Class is required';
    if (!form.dueDate)         e.dueDate  = 'Due date is required';
    if (form.duration < 10)    e.duration = 'Minimum 10 minutes';
    if (form.questionTypes.length === 0)
      e.questionTypes = 'Add at least one question type';
    form.questionTypes.forEach((qt, i) => {
      if (!qt.type) e[`qt_type_${i}`] = 'Select type';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Handlers ────────────────────────── */
  const handleAddType = () => {
    const used = form.questionTypes.map(qt => qt.type);
    const next = QUESTION_TYPE_OPTIONS.find(t => !used.includes(t));
    if (!next) { setErrors(p => ({ ...p, questionTypes: 'All question types added' })); return; }
    updateForm({ questionTypes: [...form.questionTypes, { type: next, count: 5, marks: 2 }] });
    setErrors(p => { const { questionTypes: _, ...rest } = p; return rest; });
  };

  const handleUpdate = useCallback((index: number, updated: QuestionType) => {
    const others = form.questionTypes.filter((_, i) => i !== index).map(qt => qt.type);
    if (others.includes(updated.type)) {
      setErrors(p => ({ ...p, [`qt_type_${index}`]: 'Already added' }));
      return;
    }
    setErrors(p => { const { [`qt_type_${index}`]: _, ...rest } = p; return rest; });
    const arr = [...form.questionTypes];
    arr[index] = updated;
    updateForm({ questionTypes: arr });
  }, [form.questionTypes, updateForm]);

  const handleRemove = (index: number) => {
    if (form.questionTypes.length <= 1) return;
    updateForm({ questionTypes: form.questionTypes.filter((_, i) => i !== index) });
  };

  const handleAutoDistribute = () => {
    const target = form.totalMarks;
    const types  = form.questionTypes;
    if (!types.length) return;
    const totalQ = types.reduce((s, qt) => s + qt.count, 0);
    if (!totalQ) return;
    let remaining = target;
    const updated = types.map((qt, i) => {
      if (i === types.length - 1)
        return { ...qt, marks: Math.max(1, Math.round(remaining / qt.count)) };
      const m = Math.max(1, Math.round((target * qt.count / totalQ) / qt.count));
      remaining -= m * qt.count;
      return { ...qt, marks: m };
    });
    updateForm({ questionTypes: updated });
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        schoolName: userSettings.schoolName,
        teacherName: userSettings.userName,
      };
      const result = await api.createAssignment(payload);
      setCurrentJobId(result.jobId);
      setCurrentAssignmentId(result.assignmentId);
      setGenerationStatus('queued');
      router.push(`/assignments/${result.assignmentId}?jobId=${result.jobId}`);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create assignment' });
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* ── Page header ───────────────────── */}
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Create Assignment</h2>
        <p className={styles.pageSub}>Set up assignments for your students</p>
      </div>

      {/* ── Card: Assignment Details ──────── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Assignment Details</h3>

        {/* File upload zone */}
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneOver : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { 
            e.preventDefault(); 
            setDragOver(false); 
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              setSelectedFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="Upload file"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*,.pdf,.xml,.raw"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
          {selectedFile ? (
            <>
              <div className={styles.uploadIcon} style={{ color: '#10B981' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <p className={styles.dropText} style={{ color: 'var(--color-text-primary)' }}>{selectedFile.name}</p>
              <p className={styles.dropHint}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                type="button" 
                className={styles.browseBtn} 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSelectedFile(null); 
                  if (fileInputRef.current) fileInputRef.current.value = ''; 
                }}
              >
                Remove File
              </button>
            </>
          ) : (
            <>
              <div className={styles.uploadIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className={styles.dropText}>Choose a file or drag &amp; drop it here</p>
              <p className={styles.dropHint}>JPG, PNG, pdf, xml, RAW</p>
              <button 
                type="button" 
                className={styles.browseBtn} 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse Files
              </button>
              <p className={styles.dropNote}>Upload images of your preferred document/image</p>
            </>
          )}
        </div>

        {/* Due Date */}
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dueDate">Due Date</label>
            <div className={styles.dateWrap}>
              <input
                id="dueDate"
                type="date"
                className={`${styles.input} ${errors.dueDate ? styles.inputErr : ''}`}
                value={form.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => updateForm({ dueDate: e.target.value })}
                placeholder="DD-MM-YYYY"
              />
              {errors.dueDate && <span className={styles.err}>{errors.dueDate}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="subject">Subject</label>
            <select
              id="subject"
              className={`${styles.input} ${styles.select} ${errors.subject ? styles.inputErr : ''}`}
              value={form.subject}
              onChange={e => updateForm({ subject: e.target.value })}
            >
              <option value="">Select Subject</option>
              {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.subject && <span className={styles.err}>{errors.subject}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="className">Class</label>
            <select
              id="className"
              className={`${styles.input} ${styles.select} ${errors.className ? styles.inputErr : ''}`}
              value={form.className}
              onChange={e => updateForm({ className: e.target.value })}
            >
              <option value="">Select Class</option>
              {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.className && <span className={styles.err}>{errors.className}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">Assignment Title</label>
            <input
              id="title"
              className={`${styles.input} ${errors.title ? styles.inputErr : ''}`}
              placeholder="e.g. Quiz on Electricity"
              value={form.title}
              onChange={e => updateForm({ title: e.target.value })}
            />
            {errors.title && <span className={styles.err}>{errors.title}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              className={`${styles.input} ${errors.duration ? styles.inputErr : ''}`}
              value={form.duration}
              min={10}
              onChange={e => updateForm({ duration: Number(e.target.value) })}
            />
            {errors.duration && <span className={styles.err}>{errors.duration}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="totalMarks">
              Target Total Marks
              <button type="button" className={styles.autoChip} onClick={handleAutoDistribute}>
                Auto ⚡
              </button>
            </label>
            <input
              id="totalMarks"
              type="number"
              className={styles.input}
              value={form.totalMarks}
              min={1}
              onChange={e => updateForm({ totalMarks: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* ── Card: Question Type ─────────────── */}
      <div className={styles.card}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardTitle}>Question Type</h3>
        </div>

        {errors.questionTypes && (
          <div className={styles.errBanner}>{errors.questionTypes}</div>
        )}

        {/* Table header */}
        <div className={styles.qtHeader}>
          <span className={styles.qtHeaderType}>Question Type</span>
          <span className={styles.qtHeaderNum}>No. of Questions</span>
          <span className={styles.qtHeaderMarks}>Marks</span>
          <span style={{ width: 32 }} />
        </div>

        {/* Rows */}
        <div className={styles.qtList}>
          {form.questionTypes.map((qt, i) => (
            <QuestionTypeRow
              key={i}
              index={i}
              questionType={qt}
              availableTypes={QUESTION_TYPE_OPTIONS}
              usedTypes={form.questionTypes.map(q => q.type).filter((_, j) => j !== i)}
              onChange={updated => handleUpdate(i, updated)}
              onRemove={() => handleRemove(i)}
              canRemove={form.questionTypes.length > 1}
              typeError={errors[`qt_type_${i}`]}
            />
          ))}
        </div>

        {/* Add link */}
        <button type="button" className={styles.addLink} onClick={handleAddType}>
          + Add Question Type
        </button>

        {/* Totals — right aligned, exactly as Figma */}
        <div className={styles.totals}>
          <span className={styles.totalText}>
            Total Questions: <strong>{totalQuestions}</strong>
          </span>
          <span className={styles.totalSep}>|</span>
          <span className={`${styles.totalText} ${!marksOk ? styles.totalWarn : ''}`}>
            Total Marks: <strong>{totalMarks}</strong>
            {!marksOk && <span className={styles.warnNote} style={{ color: '#F59E0B', marginLeft: '8px', fontWeight: 600 }}>⚠️ Marks may not add up as expected</span>}
          </span>
        </div>
      </div>

      {/* ── Card: Additional Information ─── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Additional Information (for better output)</h3>
        <textarea
          id="additionalInfo"
          className={styles.textarea}
          rows={4}
          placeholder="e.g Generate a question paper for 3 hour exam duration..."
          value={form.additionalInfo}
          onChange={e => updateForm({ additionalInfo: e.target.value })}
        />
      </div>

      {/* ── Submit error ─────────────────── */}
      {errors.submit && (
        <div className={styles.submitErr}>{errors.submit}</div>
      )}

      {/* ── Footer: Previous / Next ────────── */}
      <div className={styles.footer}>
        <button type="button" className={styles.prevBtn} onClick={() => router.push('/assignments')}>
          ← Previous
        </button>
        <button
          type="button"
          className={styles.nextBtn}
          onClick={handleSubmit}
          disabled={submitting}
          id="generate-btn"
        >
          {submitting ? (
            <><span className={styles.spinner} /> Generating...</>
          ) : (
            'Next →'
          )}
        </button>
      </div>
    </div>
  );
}
