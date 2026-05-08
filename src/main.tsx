import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './Landing.tsx'   // Step 1: Pitch
import Login from './Login.tsx'       // Step 2: Access
import App from './App.tsx'           // Step 3: Setup
import Pricing from './Pricing.tsx'   // Step 4: Selection
import Checkout from './Checkout.tsx' // Step 4.5: Payment 💳
import Dashboard from './Dashboard.tsx' // Step 5: Command Center

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The Public Entrance */}
        <Route path="/" element={<Landing />} />
        
        {/* The Merchant Onboarding */}
        <Route path="/login" element={<Login />} />
        
        {/* The Store Configuration */}
        <Route path="/create" element={<App />} />
        
        {/* The Monetization Layer */}
        <Route path="/pricing" element={<Pricing />} />
        
        {/* The Transaction Point */}
        <Route path="/checkout" element={<Checkout />} />
        
        {/* The Private Command Center */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)