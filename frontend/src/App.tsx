import { useState } from 'react'
import './index.css'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Landing } from './screens/Landing'
import { Game } from './screens/Game'

export default function App() {
  return (
    <div className="h-screen bg-[oklch(26.8%_0.007_34.298)]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


