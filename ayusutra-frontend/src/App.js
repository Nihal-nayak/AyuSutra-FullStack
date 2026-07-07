import React from 'react';
import Diagnostics from './pages/Diagnostics';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Symptoms from './pages/Symptoms';
import Hospitals from './pages/Hospitals';
import BloodBank from './pages/BloodBank';

// Custom active controller link tag logic
function NavItem({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`${isActive
          ? 'text-primary font-bold border-b-2 border-primary pb-1'
          : 'text-on-surface-variant font-medium hover:text-primary transition-colors'
        } font-sans text-sm tracking-wide`}
    >
      {label}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="font-sans text-on-surface min-h-screen flex flex-col bg-background selection:bg-primary-fixed">

        {/* High-Fidelity Navigation Header Layer */}
        <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md border-b border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center px-10 py-4 max-w-container-max mx-auto">

            {/* Left Frame Logo Block */}
            <div className="flex items-center gap-8">
              <Link className="font-serif text-2xl font-bold text-primary flex items-center gap-2" to="/">
                <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                AyuSutra
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <NavItem to="/" label="Home" />
                <NavItem to="/symptoms" label="Symptoms" />
                <NavItem to="/hospitals" label="Hospitals" />
                <NavItem to="/diagnostics" label="Diagnostics" />
                <NavItem to="/blood-bank" label="Blood Bank" />
                <NavItem to="/records" label="Records" />
                <NavItem to="/chat" label="Chat" />
              </nav>
            </div>

            {/* Right Frame Action Block */}
            <div className="flex items-center gap-4">
              {/* Language Picker Dropdown matching Stitch template mockup design */}
              <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low border rounded-full text-xs font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-base">language</span>
                <span className="bg-primary text-white px-1.5 py-0.5 rounded-full text-[10px]">EN</span>
                <span className="cursor-pointer opacity-70 hover:opacity-100 text-[10px]">हिं</span>
                <span className="cursor-pointer opacity-70 hover:opacity-100 text-[10px]">ಕ</span>
              </div>

              {/* Theme Trigger Button */}
              <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant flex items-center">
                <span className="material-symbols-outlined text-xl">dark_mode</span>
              </button>

              {/* User Avatar Context Frame */}
              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  N
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold leading-none text-slate-800">nihal</p>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Patient</p>
                </div>
              </div>

              <button className="px-4 py-1.5 rounded-full border border-outline-variant text-xs font-bold hover:bg-surface-container-low transition-all">
                Sign Out
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic Display Rendering Engine */}
        <main className="flex-grow pt-36 pb-20 max-w-container-max mx-auto w-full px-10">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Swapped hardcoded text with your actual functional component engines */}
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/hospitals" element={<Hospitals />} />

            <Route path="/blood-bank" element={<BloodBank />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/records" element={<div className="p-4 font-serif text-2xl font-bold text-primary">Encrypted Records Vault Loading...</div>} />
            <Route path="/chat" element={<div className="p-4 font-serif text-2xl font-bold text-primary">Vedic AI Assistant Console Loading...</div>} />
          </Routes>
        </main>

        {/* Compact, Clean Footer Layer */}
        <footer className="bg-white border-t border-outline-variant/30 py-6 mt-auto">
          <div className="max-w-container-max mx-auto px-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-on-surface-variant">
            <p>© 2026 AyuSutra Healthcare. All rights reserved. Lifespan Guided Care.</p>
            <div className="flex items-center gap-2 bg-[#fcf9f8] px-3 py-1 border border-outline-variant/40 rounded-lg text-[11px] font-semibold text-primary">
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>NDHM National Government Certified</span>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}

export default App;