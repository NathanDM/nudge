import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import FamillePage from './pages/FamillePage';
import AmisPage from './pages/AmisPage';
import GiftListPage from './pages/GiftListPage';
import ProfilePage from './pages/ProfilePage';
import JoinPage from './pages/JoinPage';
import AppShell from './components/layout/AppShell';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/join/:token" element={<JoinPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<FamillePage />} />
          <Route path="/amis" element={<AmisPage />} />
          <Route path="/user/:userId" element={<GiftListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
