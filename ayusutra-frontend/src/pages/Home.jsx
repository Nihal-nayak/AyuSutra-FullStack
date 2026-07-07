import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  // --- Live Home Location Sync States ---
  const [homeLocationText, setHomeLocationText] = useState('Detecting location...');
  const [isHomeTracking, setIsHomeTracking] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setHomeLocationText('Bengaluru, KA (Default Fallback)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setIsHomeTracking(true);

        // Fetch user-friendly neighborhood names from Nominatim safely
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.address) {
              const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential;
              const city = data.address.city || data.address.town || data.address.village;
              
              if (neighborhood && city) {
                setHomeLocationText(`Using ${neighborhood}, ${city}`);
              } else if (city) {
                setHomeLocationText(`Using ${city}`);
              } else {
                setHomeLocationText('Using Current Location');
              }
            } else {
              setHomeLocationText('Using Current Location');
            }
          })
          .catch(() => {
            setHomeLocationText('Using Current Location');
          });
      },
      (error) => {
        setHomeLocationText('Using Bengaluru (default)');
        setIsHomeTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return (
    <div className="py-4">
      {/* Streamlined Hero & Bento Section Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side Presentation Content */}
        <div className="lg:col-span-7">
          {/* Sanskrit Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ffdbcb] text-[#341000] rounded-full mb-8">
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span className="text-xs font-bold uppercase tracking-wider font-sans">
              AYU (आयुष) — Lifespan in Sanskrit
            </span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl text-on-surface mb-6 leading-tight font-bold">
            Healthcare, closer than <br className="hidden md:block"/> you <span className="text-primary italic font-normal">think.</span>
          </h1>
          
          <p className="font-sans text-lg text-on-surface-variant mb-4 max-w-lg leading-relaxed">
            Find hospitals, check symptoms, and get AI health guidance powered by the fusion of Vedic wisdom and modern science.
          </p>

          {/* Connected Dynamic Location Chip Component */}
          <div className="inline-flex items-center gap-2 bg-[#d1fcd1]/60 px-4 py-2 rounded-full border border-green-200/50 mb-10">
            <span className={`w-2.5 h-2.5 rounded-full bg-green-500 ${isHomeTracking ? 'animate-pulse' : ''}`}></span>
            <span className="material-symbols-outlined text-sm text-green-700">location_on</span>
            <span className="text-sm font-sans font-bold text-green-800 tracking-wide select-none">
              {homeLocationText}
            </span>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/symptoms')}
              className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-[0px_4px_20px_rgba(160,65,0,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Analyze Symptoms
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button 
              onClick={() => navigate('/hospitals')}
              className="px-8 py-4 bg-white text-on-surface border border-outline-variant rounded-full font-bold hover:bg-surface-container-low transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined">explore</span>
              Directions
            </button>
          </div>
        </div>

        {/* Right Side Bento Grid of Core Services */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          {/* Ambient Glow Aura */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-container/5 blur-[120px] rounded-full"></div>
          
          {/* Card 1: Symptom Checker */}
          <div onClick={() => navigate('/symptoms')} className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-primary-container card-glow cursor-pointer">
            <div className="mb-4">
              <span className="material-symbols-outlined text-primary-container text-4xl block">stethoscope</span>
            </div>
            <h3 className="font-serif text-xl font-bold mb-1 text-on-surface">Symptom Checker</h3>
            <p className="text-xs text-on-surface-variant font-medium">AI scoring + specialist mapping</p>
          </div>

          {/* Card 2: Nearby Hospitals */}
          <div onClick={() => navigate('/hospitals')} className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-secondary card-glow cursor-pointer">
            <div className="mb-4">
              <span className="material-symbols-outlined text-secondary text-4xl block">local_hospital</span>
            </div>
            <h3 className="font-serif text-xl font-bold mb-1 text-on-surface">Nearby Hospitals</h3>
            <p className="text-xs text-on-surface-variant font-medium">Google Maps + real distance</p>
          </div>

          {/* Card 3: Blood Bank */}
          <div onClick={() => navigate('/blood-bank')} className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-error card-glow cursor-pointer">
            <div className="mb-4">
              <span className="material-symbols-outlined text-error text-4xl block" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
            </div>
            <h3 className="font-serif text-xl font-bold mb-1 text-on-surface">Blood Bank</h3>
            <p className="text-xs text-on-surface-variant font-medium">Find donors near you</p>
          </div>

          {/* Card 4: Diagnostics */}
          <div onClick={() => navigate('/diagnostics')} className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-tertiary card-glow cursor-pointer">
            <div className="mb-4">
              <span className="material-symbols-outlined text-tertiary text-4xl block">biotech</span>
            </div>
            <h3 className="font-serif text-xl font-bold mb-1 text-on-surface">Diagnostics</h3>
            <p className="text-xs text-on-surface-variant font-medium">Nearest labs & centres</p>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Home;