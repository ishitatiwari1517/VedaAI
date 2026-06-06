'use client';

import Link from 'next/link';
import styles from './EmptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.container} id="empty-state">
      {/* Magnifying glass with X — exact Figma illustration */}
      <div className={styles.illustration}>
        <svg width="180" height="150" viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floating dots & squiggles */}
          <path d="M40 40 Q 30 50 40 60" stroke="#111827" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="20" cy="80" r="4" fill="#D1FAE5" />
          <circle cx="160" cy="50" r="3" fill="#FEF3C7" />
          <circle cx="150" cy="110" r="5" fill="#FEE2E2" />
          
          {/* Document Base */}
          <rect x="65" y="20" width="60" height="80" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
          <line x1="75" y1="40" x2="115" y2="40" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          <line x1="75" y1="55" x2="115" y2="55" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          <line x1="75" y1="70" x2="100" y2="70" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          
          {/* Magnifying Glass Outer Ring */}
          <circle cx="95" cy="85" r="35" fill="white" stroke="#000000" strokeWidth="3" />
          
          {/* Inner Red Circle with X */}
          <circle cx="95" cy="85" r="22" fill="#FEE2E2" />
          <path d="M85 75 L105 95 M105 75 L85 95" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          
          {/* Magnifying Glass Handle */}
          <line x1="120" y1="110" x2="140" y2="130" stroke="#000000" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <div className={styles.content}>
        <h2 className={styles.heading}>No assignments yet</h2>
        <p className={styles.subtext}>
          Create your first assignment to start collecting and grading student
          submissions. You can set up rubrics, define marking criteria and let AI
          assist with grading.
        </p>
      </div>

      <Link href="/assignments/create" className={styles.ctaButton} id="create-first-assignment-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Create Your First Assignment
      </Link>
    </div>
  );
}
