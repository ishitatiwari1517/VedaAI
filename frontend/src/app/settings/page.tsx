'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useAssignmentStore } from '@/stores/assignmentStore';

export default function SettingsPage() {
  const { userSettings, updateUserSettings } = useAssignmentStore();

  const [formData, setFormData] = useState({
    userName: userSettings.userName,
    userEmail: userSettings.userEmail,
    schoolName: userSettings.schoolName,
    schoolCity: userSettings.schoolCity,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUserSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const userInitials = formData.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Settings" />
        <div style={{ flex: 1, padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Profile</h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 700 }}>
                {userInitials}
              </div>
              <div>
                <button style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Change Avatar</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Name</label>
                <input 
                  type="text" 
                  value={formData.userName} 
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Email</label>
                <input 
                  type="email" 
                  value={formData.userEmail} 
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none' }} 
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Subject Specialization</label>
                <input type="text" defaultValue="Science" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>School Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>School Name</label>
                <input 
                  type="text" 
                  value={formData.schoolName} 
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>City</label>
                <input 
                  type="text" 
                  value={formData.schoolCity} 
                  onChange={(e) => setFormData({ ...formData, schoolCity: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Board</label>
                <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none', background: 'white', appearance: 'none' }}>
                  <option>CBSE</option>
                  <option>ICSE</option>
                  <option>State Board</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>AI Preferences</h3>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>Default Difficulty Distribution</label>
              <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', width: '100%' }}>
                <div style={{ width: '40%', background: '#10B981' }} title="Easy: 40%"></div>
                <div style={{ width: '40%', background: '#F59E0B' }} title="Medium: 40%"></div>
                <div style={{ width: '20%', background: '#EF4444' }} title="Hard: 20%"></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                <span>Easy 40%</span>
                <span>Medium 40%</span>
                <span>Hard 20%</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Language</label>
              <select style={{ width: '100%', maxWidth: '200px', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', outline: 'none', background: 'white', appearance: 'none' }}>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            {saved && <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>Saved!</span>}
            <button 
              onClick={handleSave}
              style={{ padding: '12px 32px', background: 'var(--color-text-primary)', color: 'white', borderRadius: '9999px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
