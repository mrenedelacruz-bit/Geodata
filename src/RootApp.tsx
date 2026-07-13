import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.tsx'
import { LocationProvider } from './contexts/LocationContext'

export default function RootApp() {
  return (
    <BrowserRouter basename="/Geodata/">
      <Routes>
        <Route path="/santo-domingo" element={<LocationProvider location="santo-domingo"><App location="santo-domingo" /></LocationProvider>} />
        <Route path="/puerto-plata" element={<LocationProvider location="puerto-plata"><App location="puerto-plata" /></LocationProvider>} />
        <Route path="/" element={<Navigate to="/santo-domingo" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
