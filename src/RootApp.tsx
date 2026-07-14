import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.tsx'

export default function RootApp() {
  return (
    <BrowserRouter basename="/Geodata/">
      <Routes>
        <Route path="/santo-domingo" element={<App location="santo-domingo" />} />
        <Route path="/puerto-plata" element={<App location="puerto-plata" />} />
        <Route path="/la-altagracia" element={<App location="la-altagracia" />} />
        <Route path="/" element={<Navigate to="/santo-domingo" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
