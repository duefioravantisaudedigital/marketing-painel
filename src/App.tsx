import { Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RotaProtegida } from './components/RotaProtegida'
import Login from './pages/Login'

function Pacientes() {
  return <h1 className="text-xl font-semibold text-marca-escuro">Pacientes</h1>
}

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
