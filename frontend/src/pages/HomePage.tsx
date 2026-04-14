import { Navigate } from 'react-router-dom';

// Replaced by FamillePage ("/") and AmisPage ("/amis")
export default function HomePage() {
  return <Navigate to="/" replace />;
}
