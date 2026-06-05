const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const api = {
  async createAssignment(data: object) {
    const res = await fetch(`${BACKEND_URL}/api/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create assignment');
    }
    return res.json();
  },

  async getAssignments() {
    const res = await fetch(`${BACKEND_URL}/api/assignments`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return res.json();
  },

  async getAssignment(id: string) {
    const res = await fetch(`${BACKEND_URL}/api/assignments/${id}`);
    if (!res.ok) throw new Error('Assignment not found');
    return res.json();
  },

  async getAssignmentPaper(assignmentId: string) {
    const res = await fetch(`${BACKEND_URL}/api/assignments/${assignmentId}/paper`);
    if (!res.ok) throw new Error('Paper not found');
    return res.json();
  },

  async getPaper(paperId: string) {
    const res = await fetch(`${BACKEND_URL}/api/assignments/paper/${paperId}`);
    if (!res.ok) throw new Error('Paper not found');
    return res.json();
  },

  async deleteAssignment(id: string) {
    const res = await fetch(`${BACKEND_URL}/api/assignments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete');
    return res.json();
  },
};
