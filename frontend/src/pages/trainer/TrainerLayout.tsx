import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import StudentsList from './StudentsList';
import StudentDetail from './StudentDetail';
import AllSessions from './AllSessions';
import TodaySessions from './TodaySessions';
import UpcomingSessions from './UpcomingSessions';

const TrainerLayout = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/students" element={<StudentsList />} />
      <Route path="/students/:id" element={<StudentDetail />} />
      <Route path="/sessions" element={<AllSessions />} />
      <Route path="/sessions/today" element={<TodaySessions />} />
      <Route path="/sessions/upcoming" element={<UpcomingSessions />} />
      <Route path="*" element={<Navigate to="/trainer" replace />} />
    </Routes>
  );
};

export default TrainerLayout;
