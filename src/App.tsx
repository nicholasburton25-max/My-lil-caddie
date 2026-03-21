import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RecordShot from './pages/RecordShot';
import ShotHistory from './pages/ShotHistory';
import ClubRecommendation from './pages/ClubRecommendation';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RecordShot />} />
        <Route path="/history" element={<ShotHistory />} />
        <Route path="/recommend" element={<ClubRecommendation />} />
        <Route path="/stats" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
}
