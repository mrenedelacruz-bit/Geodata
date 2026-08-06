import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.tsx'
import { LOCATIONS } from './data/locations'

export default function RootApp() {
  return (
    <BrowserRouter basename="/Geodata/">
      <Routes>
        {Object.keys(LOCATIONS).map((id) => (
          <Route key={id} path={`/${id}`} element={<App location={id} />} />
        ))}
        {/* Redirigir conservando el query string: un enlace compartido de la
            raíz (?cat=..&lat=..) debe reproducir el análisis tras redirigir. */}
        <Route
          path="*"
          element={<Navigate to={{ pathname: '/santo-domingo', search: window.location.search }} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
