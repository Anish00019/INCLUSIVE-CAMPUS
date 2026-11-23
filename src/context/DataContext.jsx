import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import dataApi, { resetDemoData } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,setError]=useState('');
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    const data = await dataApi.bootstrap();
    setDb({ ...data });
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {const data = await dataApi.bootstrap();
        if (alive) { setDb({ ...data }); setError(''); }
      } catch(error) {if(alive)setError(error.message);}
      finally {if(alive)setLoading(false);}
    })();
    return () => { alive = false; };
  }, [user?.id]);

  /* Derived demo identity: which student / faculty record belongs to the logged-in user */
  const me = useMemo(() => {
    if (!db || !user) return null;
    if (user.role === 'student') {
      const student = db.students.find((s) => s.userId === user.id);
      return { ...user, student };
    }
    if (user.role === 'faculty') {
      const profile = db.faculty.find((f) => f.userId === user.id);
      return { ...user, faculty: profile };
    }
    return { ...user };
  }, [db, user]);

  /* List of support requests visible to the current user */
  const myRequests = useMemo(() => {
    if (!db) return [];
    if (user?.role === 'student') return db.supportRequests.filter((r) => r.studentId === me?.student?.id);
    return db.supportRequests;
  }, [db, user, me]);

  const notifications = useMemo(() => {
    if (!db) return [];
    return db.notifications.filter((n) => !n.forUserId || n.forUserId === user?.id);
  }, [db, user]);

  const actions = useMemo(() => ({
    async submitRequest(payload) {
      const req = await dataApi.createRequest(payload);
      await refresh();
      return req;
    },
    async updateStatus(id, status, note, assignedTo) {
      dataApi.updateRequestStatus(id, status, note, assignedTo);
      await refresh();
    },
    assignStaff(id, staffId) { dataApi.assignStaff(id, staffId); refresh(); },
    markRead(id) { dataApi.markNotificationRead(id); refresh(); },
    markAllRead() { dataApi.markAllRead(); refresh(); },
    clearNotifications() { dataApi.clearNotifications(); refresh(); },
    sendMessage(threadId, text) { dataApi.sendMessage(threadId, text); refresh(); },
    markThreadRead(threadId) { dataApi.markThreadRead(threadId); refresh(); },
    startThread(payload) { const t = dataApi.startThread(payload); refresh(); return t; },
    createAssignment(payload) { dataApi.createAssignment(payload); refresh(); },
    gradeAssignment(id, marks, feedback) { dataApi.gradeAssignment(id, marks, feedback); refresh(); },
    remindAssignment(assignment) { dataApi.remindAssignment(assignment); refresh(); },
    submitAssignment(id, note, files) { dataApi.submitAssignment(id, note, files); refresh(); },
    markAttendance(subjectId, present) { dataApi.markAttendance(subjectId, present); refresh(); },
    recordAttendance(payload) { const s = dataApi.recordAttendance(payload); refresh(); return s; },
    addMaterial(payload) { dataApi.addMaterial(payload); refresh(); },
    saveRecord(collection, payload) { const r = dataApi.saveRecord(collection, payload); refresh(); return r; },
    saveReport(payload) { const r = dataApi.saveReport(payload); refresh(); return r; },
    reset() { resetDemoData(); setVersion((v) => v + 1); refresh(); },
  }), [refresh]);

  const value = useMemo(() => ({ db, loading, version, refresh, me, myRequests, notifications, actions }), [db, loading, version, refresh, me, myRequests, notifications, actions]);

  return <DataContext.Provider value={value}>{error ? <main role="alert" className="card m-6 p-6"><h1 className="text-lg font-bold">Records could not be loaded</h1><p>{error}</p><button className="btn-primary mt-4" onClick={()=>window.location.reload()}>Retry loading</button></main> : children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
};
