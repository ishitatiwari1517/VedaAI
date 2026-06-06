'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Assignment } from '@/stores/assignmentStore';
import { api } from '@/lib/api';
import styles from './AssignmentCard.module.css';

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this assignment?')) return;
    setDeleting(true);
    try {
      await api.deleteAssignment(assignment._id);
      onDelete(assignment._id);
    } catch {
      alert('Failed to delete');
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const isReady = assignment.status === 'done' && assignment.paperId;

  return (
    <div
      className={`${styles.card} ${deleting ? styles.deleting : ''}`}
      id={`assignment-card-${assignment._id}`}
    >
      {/* Title row */}
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{assignment.title}</h3>

        {/* 3-dot menu */}
        <div className={styles.menuWrap}>
          <button
            className={styles.menuBtn}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="Options"
            id={`menu-btn-${assignment._id}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.8"/>
              <circle cx="12" cy="12" r="1.8"/>
              <circle cx="12" cy="19" r="1.8"/>
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
              <div className={styles.dropdown}>
                {isReady && (
                  <Link
                    href={`/assignments/${assignment._id}`}
                    className={styles.dropdownItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    View Assignment
                  </Link>
                )}
                <button
                  className={`${styles.dropdownItem} ${styles.deleteItem}`}
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dates row — exact Figma format */}
      <div className={styles.datesRow}>
        <span className={styles.dateText}>
          Assigned on:{' '}
          <span className={styles.dateVal}>{formatDate(assignment.createdAt)}</span>
        </span>
        <span className={styles.dateSep}>|</span>
        <span className={styles.dateText}>
          Due:{' '}
          <span className={styles.dateVal}>{assignment.dueDate}</span>
        </span>
      </div>

      {/* Status indicator (only if not done) */}
      {assignment.status !== 'done' && (
        <div className={styles.statusRow}>
          <span
            className={`${styles.statusPill} ${
              assignment.status === 'error' ? styles.statusError :
              assignment.status === 'generating' || assignment.status === 'validating' ? styles.statusActive :
              styles.statusPending
            }`}
          >
            {assignment.status === 'generating' && <span className={styles.blip} />}
            {assignment.status === 'validating' && <span className={styles.blip} />}
            {assignment.status === 'queued' ? 'Queued' :
             assignment.status === 'generating' ? 'Generating...' :
             assignment.status === 'validating' ? 'Validating...' :
             assignment.status === 'error' ? 'Failed' : 'Pending'}
          </span>
        </div>
      )}

      {/* Quick link when ready */}
      {isReady && (
        <Link
          href={`/assignments/${assignment._id}`}
          className={styles.viewLink}
        >
          View Assignment →
        </Link>
      )}
    </div>
  );
}
