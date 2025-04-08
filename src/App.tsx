import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import Catalog from './pages/Catalog';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import QuizCreator from './pages/admin/QuizCreator';
import QuizList from './pages/admin/QuizList';
import SurveyCreator from './pages/admin/SurveyCreator';
import SurveyList from './pages/admin/SurveyList';
import DocumentGenerator from './pages/admin/DocumentGenerator';
import Calendar from './pages/admin/Calendar';
import FormationList from './pages/admin/FormationList';
import FormationForm from './pages/admin/FormationForm';
import InstructorList from './pages/admin/InstructorList';
import TraineeList from './pages/admin/TraineeList';
import AttendanceList from './pages/admin/AttendanceList';
import SessionForm from './pages/admin/SessionForm';

// Instructor pages
import InstructorDashboard from './pages/instructor/Dashboard';
import SessionManager from './pages/instructor/SessionManager';
import ResultsTracker from './pages/instructor/ResultsTracker';
import FeedbackCenter from './pages/instructor/FeedbackCenter';

// Trainee pages
import TraineeDashboard from './pages/trainee/Dashboard';
import Registration from './pages/Registration';
import Conventions from './pages/Conventions';
import Assessments from './pages/Assessments';
import Attendance from './pages/Attendance';
import Certificates from './pages/Certificates';
import Quiz from './pages/Quiz';
import Survey from './pages/Survey';

// Temporary mock authentication state
const userRole = 'admin'; // 'admin' | 'instructor' | 'trainee' | null

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        {userRole ? (
          <>
            <Navbar />
            <div className="flex">
              <Sidebar userRole={userRole} />
              <main className="flex-1 p-8">
                <Routes>
                  {userRole === 'admin' && (
                    <>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/admin/calendar" element={<Calendar />} />
                      <Route path="/admin/trainees" element={<TraineeList />} />
                      <Route path="/admin/formations" element={<FormationList />} />
                      <Route path="/admin/formations/new" element={<SessionForm />} />
                      <Route path="/admin/instructors" element={<InstructorList />} />
                      <Route path="/admin/attendance" element={<AttendanceList />} />
                      <Route path="/admin/quiz-list" element={<QuizList />} />
                      <Route path="/admin/quiz" element={<QuizCreator />} />
                      <Route path="/admin/survey-list" element={<SurveyList />} />
                      <Route path="/admin/sessions/new" element={<SessionForm />} />
                      <Route path="/admin/survey" element={<SurveyCreator />} />
                      <Route path="/admin/documents" element={<DocumentGenerator />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  )}

                  {userRole === 'instructor' && (
                    <>
                      <Route path="/" element={<InstructorDashboard />} />
                      <Route path="/instructor/sessions" element={<SessionManager />} />
                      <Route path="/instructor/results" element={<ResultsTracker />} />
                      <Route path="/instructor/feedback" element={<FeedbackCenter />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  )}

                  {userRole === 'trainee' && (
                    <>
                      <Route path="/" element={<TraineeDashboard />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/registration" element={<Registration />} />
                      <Route path="/conventions" element={<Conventions />} />
                      <Route path="/assessments" element={<Assessments />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/certificates" element={<Certificates />} />
                      <Route path="/quiz/:id" element={<Quiz />} />
                      <Route path="/survey/:id" element={<Survey />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  )}
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;