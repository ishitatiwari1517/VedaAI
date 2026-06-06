'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import AssignmentCard from '@/components/dashboard/AssignmentCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { useAssignmentStore } from '@/stores/assignmentStore';
import styles from './page.module.css';

export default function DashboardPage() {
  const { assignments, setAssignments } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // In a real app, fetch from backend here. 
    // Using store state directly for demo purposes to simulate fetching.
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const filtered = assignments.filter(a => 
    a.subject.toLowerCase().includes(search.toLowerCase()) ||
    a.className.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <TopBar title="Assignments" />
        
        <div className={styles.content}>
          {loading ? (
            <div className={styles.skeletonGrid}>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Header texts per spec */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Manage and create assignments for your classes.
                </p>
              </div>

              {/* Filter bar */}
              <div className={styles.filterRow}>
                <div className={styles.filterLeft}>
                  <button className={styles.filterBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filter
                  </button>
                  <button className={styles.filterBtn}>Class</button>
                  <button className={styles.filterBtn}>Subject</button>
                </div>
                
                <div className={styles.searchWrap}>
                  <svg className={styles.searchIco} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input 
                    type="text" 
                    className={styles.searchInput}
                    placeholder="Search assignments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className={styles.noResults}>No assignments found matching "{search}".</div>
              ) : (
                <div className={styles.grid}>
                  {filtered.map(assignment => (
                    <AssignmentCard 
                      key={assignment._id} 
                      assignment={assignment} 
                      onDelete={() => useAssignmentStore.getState().removeAssignment(assignment._id)}
                    />
                  ))}
                </div>
              )}

              <div className={styles.createRow}>
                <Link href="/assignments/create" className={styles.createBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Assignment
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
