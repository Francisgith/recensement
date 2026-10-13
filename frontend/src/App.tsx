import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { RequireAdmin, RequireAuth } from './auth/RequireAuth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import IndividusPage from './pages/IndividusPage'
import MembresPage from './pages/MembresPage'
import PopulationPage from './pages/PopulationPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="individus" element={<IndividusPage />} />
          <Route path="membres" element={<MembresPage />} />
          <Route path="population" element={<PopulationPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
