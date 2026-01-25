import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Assignments from './Assignments';
import ParentsList from './ParentsList';
import ParentDetail from './ParentDetail';
import TrainersList from './TrainersList';
import TrainerDetail from './TrainerDetail';
import ChildrenList from './ChildrenList';
import ChildDetail from './ChildDetail';
import RevenueAnalytics from './RevenueAnalytics';

const AdminLayout = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/assignments" element={<Assignments />} />
      <Route path="/parents" element={<ParentsList />} />
      <Route path="/parents/:id" element={<ParentDetail />} />
      <Route path="/trainers" element={<TrainersList />} />
      <Route path="/trainers/:id" element={<TrainerDetail />} />
      <Route path="/children" element={<ChildrenList />} />
      <Route path="/children/:id" element={<ChildDetail />} />
      <Route path="/revenue" element={<RevenueAnalytics />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminLayout;
