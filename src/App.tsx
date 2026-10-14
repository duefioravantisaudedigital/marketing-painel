import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RotaProtegida } from './components/RotaProtegida'
import Login from './pages/Login'
import Pacientes from './pages/Pacientes'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RotaProtegida>
            <Layout>
              <Pacientes />
            </Layout>
          </RotaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
