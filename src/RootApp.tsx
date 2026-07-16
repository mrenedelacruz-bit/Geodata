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
        <Route path="/" element={<Navigate to="/santo-domingo" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
