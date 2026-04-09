import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import CertificateUpload from './pages/CertificateUpload';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ProfileSettings from './pages/ProfileSettings';
import AchievementGallery from './pages/AchievementGallery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes for Student */}
        <Route path="/student" element={<DashboardLayout role="student" />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="upload" element={<CertificateUpload />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route 
            path="records" 
            element={<AchievementGallery title="Academic Records" categories={['Academic', 'Co-Curricular']} />} 
          />
          <Route 
            path="achievements" 
            element={<AchievementGallery title="Personal Achievements" categories={['Extra-Curricular', 'Sports', 'Cultural', 'Other']} />} 
          />
          <Route 
            path="portfolio" 
            element={<AchievementGallery title="Project Portfolio" categories={['Project', 'Internship', 'Workshop']} />} 
          />
          <Route index element={<Navigate to="/student/dashboard" replace />} />
        </Route>

        {/* Protected Routes for Faculty */}
        <Route path="/faculty" element={<DashboardLayout role="faculty" />}>
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route index element={<Navigate to="/faculty/dashboard" replace />} />
        </Route>

        {/* Protected Routes for Admin */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="management" element={<UserManagement />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
