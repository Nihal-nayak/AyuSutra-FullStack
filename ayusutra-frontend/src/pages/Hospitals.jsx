import React, { useState, useEffect } from 'react';

function Hospitals() {
  const PAGE_SIZE = 9;

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  // Filter Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Bengaluru'); // Default active pill

  // Live Location Synchronization States
  const [userLat, setUserLat] = useState(12.9716);
  const [userLng, setUserLng] = useState(77.5946);
  const [locationStatus, setLocationStatus] = useState('Share your location to find hospitals near you');
  const [isTracking, setIsTracking] = useState(false);
  const [locationReady, setLocationReady] = useState(true); // Default to true to allow initial load with defaults

  const districts = ['All Districts', 'Bengaluru', 'Mysuru', 'Belagavi', 'Tumakuru', 'Kalaburagi', 'Dakshina Kannada', 'Hassan', 'Mandya', 'Shivamogga', 'Dharwad', 'Ballari', 'Udupi', 'Kolar', 'Davanagere'];
  const specialties = ['Cardiology', 'Cardiothoracic Surgery', 'General Medicine', 'Ophthalmology', 'General Surgery', 'ENT', 'Neurology', 'Pediatrics'];
  const schemes = ['Ayushman Bharat', 'Jyothi Sanjeevini', 'Yeshasvini', 'Central Govt Health Scheme'];

  // Pure Precise Hardware Location Hook (Fixes "Use My Location")
  const refreshLocation = () => {
    if (!navigator.geolocation) return;

    setLocationStatus('Detecting precise location...');
    setLocationReady(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLat(lat);
        setUserLng(lng);
        setIsTracking(true);
        setLocationReady(true);
        setPage(0);

        // Reverse geocoding to display active neighborhood string dynamically
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.address) {
              const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential;
              const city = data.address.city || data.address.town || data.address.village;
              setLocationStatus(neighborhood && city ? `Live near: ${neighborhood}, ${city}` : `Live near: ${city}`);
            } else {
              setLocationStatus('Tracking precise real-time location');
            }
          })
          .catch(() => setLocationStatus('Tracking precise real-time location'));
      },
      () => {
        setLocationStatus('Using Bengaluru defaults (Permission denied)');
        setIsTracking(false);
        setLocationReady(true);
      },
      // PURE REAL-TIME CONFIG: Force the system to bypass old cached location memory
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Google Maps Navigation Redirect (Bypasses faulty database coordinate traps)
  const openDirections = (hospital) => {
    const origin = `${userLat},${userLng}`;
    
    // Construct a clean, highly specific text search query using the real hospital name and address details
    const searchString = [
      hospital.name, 
      hospital.address || hospital.district, 
      'Karnataka'
    ].filter(Boolean).join(', ');
    
    const destination = encodeURIComponent(searchString);
    
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
  };

  // Triggers native WhatsApp sharing with a pre-formatted template
  const shareOnWhatsApp = (hospital) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      [hospital.name, hospital.address || hospital.district, 'Karnataka'].filter(Boolean).join(', ')
    )}`;
    
    const message = `🏥 *Hospital Detail from AyuSutra* 🏥\n\n*Name:* ${hospital.name}\n*Location:* ${hospital.address || hospital.district}\n${hospital.phoneNumber ? `*Contact:* ${hospital.phoneNumber}\n` : ''}\n📍 *Navigate via Google Maps:* ${mapsUrl}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Run initial hardware location check on page load automatically
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setIsTracking(true);
      },
      () => {
        setIsTracking(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Reset page to 0 whenever any search filter changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedSpecialty, selectedScheme, selectedDistrict]);

  // Main Data Synchronization Lifecycle hook
  useEffect(() => {
    if (!locationReady) return;

    setLoading(true);
    const distParam = selectedDistrict === 'All Districts' ? '' : selectedDistrict;
    
    const url = `http://localhost:8080/api/hospitals/search?query=${encodeURIComponent(searchTerm)}&specialty=${encodeURIComponent(selectedSpecialty)}&district=${encodeURIComponent(distParam)}&scheme=${encodeURIComponent(selectedScheme)}&userLat=${userLat}&userLng=${userLng}&page=${page}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (page === 0) {
          setHospitals(data.hospitals || []);
        } else {
          setHospitals((prev) => [...prev, ...(data.hospitals || [])]);
        }
        setTotalResults(data.total || 0);
        setHasMore(data.hasMore || false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to connect to Hospital API Engine:", err);
        setLoading(false);
      });
  }, [searchTerm, selectedSpecialty, selectedScheme, selectedDistrict, page, userLat, userLng, locationReady]);

  return (
    <div className="p-6 space-y-8 bg-[#FAF8F5] min-h-screen">
      <header>
        <h1 className="font-serif text-4xl font-bold text-neutral-800 mb-2">Nearby Hospitals</h1>
        <p className="text-sm text-neutral-500 font-sans">Live results via Google Maps Places API + Karnataka government database</p>
      </header>

      {/* Location Access Floating Banner component */}
      <div className="bg-[#4A2E1B] text-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${isTracking ? 'animate-pulse' : ''}`}>📍</span>
          <div>
            <p className="font-bold text-sm">Enable Location for Best Results</p>
            <p className="text-xs text-neutral-300">{locationStatus}</p>
          </div>
        </div>
        <button 
          type="button"
          onClick={refreshLocation}
          className="bg-[#E07A5F] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#d46a4f] transition-all"
        >
          Use My Location
        </button>
      </div>

      {/* Inputs Filtering Control Grid block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search hospital name or speciality..." 
          className="p-3 bg-white border border-neutral-200 rounded-xl text-sm font-sans focus:outline-none focus:border-[#E07A5F]"
        />
        <select 
          value={selectedSpecialty} 
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="p-3 bg-white border border-neutral-200 rounded-xl text-sm font-sans"
        >
          <option value="">All Specialities</option>
          {specialties.map(sp => <option key={sp} value={sp}>{sp}</option>)}
        </select>
        <select 
          value={selectedScheme} 
          onChange={(e) => setSelectedScheme(e.target.value)}
          className="p-3 bg-white border border-neutral-200 rounded-xl text-sm font-sans"
        >
          <option value="">All Schemes</option>
          {schemes.map(sc => <option key={sc} value={sc}>{sc}</option>)}
        </select>
      </div>

      {/* Regional District Horizontal Pill Stack Container Wrapper */}
      <div className="flex flex-wrap gap-2">
        {districts.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDistrict(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              selectedDistrict === d 
                ? 'bg-[#E07A5F] text-white border-[#E07A5F]' 
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Live Operational Counters display label info */}
      <div className="flex justify-between items-center text-xs text-neutral-500 font-bold border-b pb-2">
        <p>Showing <span className="text-[#E07A5F]">{hospitals.length}</span> of {totalResults} hospitals</p>
        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">✓ Karnataka Govt. Database</span>
      </div>

      {/* Main 3-Column Hospital Grid Layout display list cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-serif text-lg font-bold text-neutral-800 leading-snug">{hospital.name}</h3>
                <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-2 py-0.5 rounded-md flex-shrink-0">Govt DB</span>
              </div>
              <p className="text-xs text-neutral-500 font-sans leading-relaxed">📍 {hospital.address || 'Address information on file'}</p>
              
              <div className="flex gap-2 text-[10px] font-bold items-center">
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{hospital.district}</span>
              </div>

              {/* Specialties processing chip factory block */}
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase">Specialities</p>
                <div className="flex flex-wrap gap-1">
                  {hospital.specialties && hospital.specialties.split(',').map((sp, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                      {sp.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Schemes active eligibility tracker tag block */}
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1 mt-2">
                  {hospital.supportedSchemes && hospital.supportedSchemes.split(',').map((sc, idx) => (
                    <span key={idx} className="text-blue-600 font-sans text-xs flex items-center gap-0.5 font-semibold">
                      ✓ {sc.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              {hospital.phoneNumber && (
                <p className="text-xs text-neutral-600 font-medium pt-1">📞 {hospital.phoneNumber}</p>
              )}
            </div>

            {/* Structured Stack Footer Block */}
            <div className="mt-5 pt-3 border-t border-neutral-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => openDirections(hospital)}
                  className="bg-[#E07A5F] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:brightness-95 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>🧭</span> Get Directions
                </button>
                
                <button 
                  type="button"
                  onClick={() => shareOnWhatsApp(hospital)}
                  className="bg-[#25D366] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm hover:brightness-95 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>💬</span> Share
                </button>
              </div>

              <a 
                href={`tel:${hospital.phoneNumber}`} 
                className="bg-white border border-neutral-200 text-neutral-700 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-all text-center block w-full"
              >
                📞 Call
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Conditional Load More Action Controller button layout bottom hook */}
      {hasMore && !loading && (
        <div className="text-center pt-6">
          <button 
            type="button"
            onClick={() => setPage(prev => prev + 1)}
            className="bg-white border border-neutral-300 text-neutral-700 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-all shadow-sm"
          >
            Load More Hospitals
          </button>
        </div>
      )}

      {loading && <p className="text-center text-sm text-neutral-400 font-sans">Querying local facility maps network data...</p>}
    </div>
  );
}

export default Hospitals;