import { Route, Routes } from 'react-router'

function Inicio() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-semibold text-slate-800">Painel de Marketing</h1>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
    </Routes>
  )
}
