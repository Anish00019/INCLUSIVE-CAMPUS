import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { LoadingScreen } from './components/common/ui';
import { useAuth, ROLE_HOME } from './context/AuthContext';

const About = lazy(() => import('./pages/About'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const Academics = lazy(() => import('./pages/student/Academics'));
const Timetable = lazy(() => import('./pages/student/Timetable'));
const Attendance = lazy(() => import('./pages/student/Attendance'));
const Assignments = lazy(() => import('./pages/student/Assignments'));
const Examinations = lazy(() => import('./pages/student/Examinations'));
const StudyMaterials = lazy(() => import('./pages/student/StudyMaterials'));
const SupportRequests = lazy(() => import('./pages/student/SupportRequests'));
const SupportTracking = lazy(() => import('./pages/student/SupportTracking'));
const AssistiveHub = lazy(() => import('./pages/student/AssistiveHub'));

const Profile = lazy(() => import('./pages/Profile'));
const AccessibilitySettings = lazy(() => import('./pages/AccessibilitySettings'));
const Messages = lazy(() => import('./pages/Messages'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const FacultyStudents = lazy(() => import('./pages/faculty/Students'));
const FacultyAttendance = lazy(() => import('./pages/faculty/Attendance'));
const FacultyAssignments = lazy(() => import('./pages/faculty/Assignments'));
const FacultyMaterials = lazy(() => import('./pages/faculty/Materials'));
const FacultyRequests = lazy(() => import('./pages/faculty/Requests'));

const SupportDashboard = lazy(() => import('./pages/support/Dashboard'));
const SupportManagement = lazy(() => import('./pages/support/Requests'));
const SupportStudents = lazy(() => import('./pages/support/Students'));
const SupportStaff = lazy(() => import('./pages/support/Staff'));
const SupportResources = lazy(() => import('./pages/support/Resources'));
const SupportReports = lazy(() => import('./pages/support/Reports'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminDepartments = lazy(() => import('./pages/admin/Departments'));
const AdminCourses = lazy(() => import('./pages/admin/Courses'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));

function RootRedirect() {
  const { user, role } = useAuth();
  return <Navigate to={user ? ROLE_HOME[role] : '/'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-navy-950"><LoadingScreen /></div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<RootRedirect />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/accessibility-settings" element={<AccessibilitySettings />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route element={<ProtectedRoute allow={['student', 'faculty']} />}>
              <Route path="/assistive-hub" element={<AssistiveHub />} />
            </Route>

            <Route element={<ProtectedRoute allow={['student']} />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/examinations" element={<Examinations />} />
              <Route path="/study-materials" element={<StudyMaterials />} />
              <Route path="/support" element={<SupportRequests />} />
              <Route path="/support/track" element={<SupportTracking />} />
            </Route>

            <Route element={<ProtectedRoute allow={['faculty']} />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
              <Route path="/faculty/students" element={<FacultyStudents />} />
              <Route path="/faculty/attendance" element={<FacultyAttendance />} />
              <Route path="/faculty/assignments" element={<FacultyAssignments />} />
              <Route path="/faculty/materials" element={<FacultyMaterials />} />
              <Route path="/faculty/requests" element={<FacultyRequests />} />
            </Route>

            <Route element={<ProtectedRoute allow={['support', 'admin']} />}>
              <Route path="/support-admin" element={<SupportDashboard />} />
              <Route path="/support-admin/requests" element={<SupportManagement />} />
              <Route path="/support-admin/reports" element={<SupportReports />} />
            </Route>

            <Route element={<ProtectedRoute allow={['support']} />}>
              <Route path="/support-admin/students" element={<SupportStudents />} />
              <Route path="/support-admin/staff" element={<SupportStaff />} />
              <Route path="/support-admin/resources" element={<SupportResources />} />
            </Route>

            <Route element={<ProtectedRoute allow={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
