import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import RaeumePage from '@/pages/RaeumePage';
import DozentenPage from '@/pages/DozentenPage';
import AnmeldungenPage from '@/pages/AnmeldungenPage';
import KursePage from '@/pages/KursePage';
import TeilnehmerPage from '@/pages/TeilnehmerPage';

export default function App() {
  return (
    <HashRouter>
      <ActionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="raeume" element={<RaeumePage />} />
            <Route path="dozenten" element={<DozentenPage />} />
            <Route path="anmeldungen" element={<AnmeldungenPage />} />
            <Route path="kurse" element={<KursePage />} />
            <Route path="teilnehmer" element={<TeilnehmerPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ActionsProvider>
    </HashRouter>
  );
}
