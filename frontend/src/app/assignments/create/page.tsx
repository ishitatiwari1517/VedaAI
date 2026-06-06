'use client';

import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import AssignmentForm from '@/components/create/AssignmentForm';
import styles from './page.module.css';

export default function CreatePage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        {/* Figma: "← Assignment" breadcrumb in topbar */}
        <TopBar breadcrumb="Assignment" breadcrumbHref="/assignments" />
        <div className={styles.content}>
          <AssignmentForm />
        </div>
      </div>
    </div>
  );
}
