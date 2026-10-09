import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard, PublicOnlyGuard } from './components/guards'
import { DashboardPage } from './pages/DashboardPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ReportsPage } from './pages/ReportsPage'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyGuard>
            <LoginPage />
          </PublicOnlyGuard>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyGuard>
            <RegisterPage />
          </PublicOnlyGuard>
        }
      />

      <Route element={<AuthGuard />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
