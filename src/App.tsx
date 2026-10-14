import { Navigate, Outlet, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { RotaProtegida } from './components/RotaProtegida'
import CampanhaDetalhe from './pages/CampanhaDetalhe'
import Campanhas from './pages/Campanhas'
import Login from './pages/Login'
import NovaCampanha from './pages/NovaCampanha'
import Pacientes from './pages/Pacientes'

// Todas as telas depois do login: exigem sessao e usam o mesmo cabecalho
function AreaLogada() {
  return (
    <RotaProtegida>
      <Layout>
        <Outlet />
      </Layout>
    </RotaProtegida>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AreaLogada />}>
        <Route path="/" element={<Pacientes />} />
        <Route path="/campanhas" element={<Campanhas />} />
        <Route path="/campanhas/nova" element={<NovaCampanha />} />
        <Route path="/campanhas/:id" element={<CampanhaDetalhe />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
