import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker assets in standard React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function BloodBank() {
  // Main tracking states
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(12.9716);
  const [userLng, setUserLng] = useState(77.5946);
  const [locationStatus, setLocationStatus] = useState('Share your location to find blood banks near you');
  const [isTracking, setIsTracking] = useState(false);
  
  // Filtering & Input form states
  const [selectedGroup, setSelectedGroup] = useState('Select Blood Type');

  // Registration Form state
  const [registration, setRegistration] = useState({
    fullName: '',
    bloodGroup: '',
    phone: '',
    lastDonation: '',
    agreed: false
  });

  const bloodGroupsList = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Pure Precise Hardware Location Hook (Fixes "Use My Location")
  const refreshLocation = () => {
    if (!navigator.geolocation) return;

    setLocationStatus('Detecting precise location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLat(lat);
        setUserLng(lng);
        setIsTracking(true);

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

        loadMockData(lat, lng);
      },
      () => {
        setLocationStatus('Using Bengaluru defaults (Permission denied)');
        setIsTracking(false);
        loadMockData(12.9716, 77.5946);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Run initial hardware location check on page load automatically
  useEffect(() => {
    if (!navigator.geolocation) {
      loadMockData(12.9716, 77.5946);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setIsTracking(true);
        loadMockData(lat, lng);
      },
      () => {
        setIsTracking(false);
        loadMockData(12.9716, 77.5946);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Simulates or processes active blood network nodes centered around your position
  const loadMockData = (lat, lng) => {
    setLoading(true);
    const mockBanks = [
      {
        id: 1,
        name: 'City General Blood Bank',
        lat: lat + 0.008,
        lng: lng - 0.005,
        distance: 1.2,
        verified: true,
        status: 'High',
        stocks: { 'A+': '24 Units', 'O-': '8 Units', 'B+': '15 Units' },
        phone: '08022211111'
      },
      {
        id: 2,
        name: 'Red Cross Emergency Center',
        lat: lat - 0.012,
        lng: lng + 0.015,
        distance: 3.5,
        verified: false,
        status: 'Critical',
        stocks: { 'O-': 'Urgent Need', 'AB-': '2 Units' },
        phone: '08044455555'
      },
      {
        id: 3,
        name: 'Ayurveda Wellness Research Lab',
        lat: lat + 0.019,
        lng: lng + 0.009,
        distance: 4.8,
        verified: false,
        status: 'Moderate',
        stocks: { 'B+': '10 Units', 'A+': '12 Units' },
        phone: '08077788888'
      }
    ];
    setBloodBanks(mockBanks);
    setLoading(false);
  };

  const triggerCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleRequest = (bankName) => {
    alert(`Emergency response request logged successfully for ${bankName}. AyuSutra system dispatchers notified.`);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!registration.fullName || !registration.phone || !registration.bloodGroup) {
      alert('Please fill out all primary volunteer attributes.');
      return;
    }
    alert(`Thank you ${registration.fullName}! Your volunteer saving state is now actively tracked on the AyuSutra network.`);
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen font-sans flex flex-col">
      <main className="pt-12 flex-grow">
        
        {/* Brand-Aligned Location Access Floating Banner Component */}
        <div className="max-w-[1280px] mx-auto px-10 mb-4">
          <div className="bg-[#4A2E1B] text-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${isTracking ? 'animate-pulse' : ''}`}>📍</span>
              <div className="text-left">
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
        </div>

        {/* Hero Section with Mini Map Option */}
        <section className="relative px-10 pb-16 overflow-hidden max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="font-serif text-5xl font-bold text-[#1c1b1b] mb-6 leading-tight">
                Lifesaving Care, <br/><span className="text-[#a04100]">Instantly Connected.</span>
              </h1>
              <p className="text-lg text-[#584237] max-w-lg mb-8 leading-relaxed">
                Real-time blood availability tracking across our verified partner network. Bridging Ayurvedic wellness and modern emergency diagnostics.
              </p>
              
              {/* Cleaned Search Bar Component Container with plenty of breathing room */}
              <div className="bg-white p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 border border-[#eae7e7] items-center max-w-xl">
                <div className="flex-1 w-full px-4 py-2 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#a04100] flex-shrink-0">bloodtype</span>
                  <select 
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="bg-transparent border-none outline-none w-full font-semibold text-sm cursor-pointer p-0 focus:ring-0 focus:outline-none"
                  >
                    <option>Select Blood Type</option>
                    {bloodGroupsList.map(grp => <option key={grp} value={grp}>{grp}</option>)}
                  </select>
                </div>
                <button className="w-full md:w-auto bg-[#f37021] text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-95 transition-all shadow-md active:scale-95 text-xs whitespace-nowrap flex-shrink-0">
                  Search Now
                </button>
              </div>
            </div>

            {/* LIVE MAP CONTAINER */}
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-[#e0c0b2] shadow-sm relative z-10">
              <MapContainer center={[userLat, userLng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='© <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[userLat, userLng]}>
                  <Popup>
                    <div className="p-1 text-left font-sans text-xs">
                      <p className="font-bold text-[#a04100]">Your Location</p>
                    </div>
                  </Popup>
                </Marker>
                {bloodBanks.map((bank) => (
                  <Marker key={bank.id} position={[bank.lat, bank.lng]}>
                    <Popup>
                      <div className="p-1 text-left font-sans text-xs">
                        <p className="font-bold text-[#a04100] text-sm">{bank.name}</p>
                        <p className="text-gray-500 font-bold">Stock level: {bank.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </section>

        {/* Verified Listings Grid cards */}
        <section className="bg-[#f6f3f2] px-10 py-16">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex justify-between items-end mb-12 text-left">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1c1b1b] mb-2">Verified Blood Banks</h2>
                <p className="text-[#584237] text-sm">Showing results near your active position tracking boundary</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bloodBanks.map((bank) => (
                <div 
                  key={bank.id} 
                  className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 text-left ${
                    bank.status === 'Critical' ? 'border-red-600' : bank.status === 'High' ? 'border-green-600' : 'border-blue-500'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#1c1b1b] leading-tight">{bank.name}</h3>
                        <p className="text-xs text-[#584237] flex items-center gap-1 mt-1 font-semibold">
                          🧭 {bank.distance} km away
                        </p>
                      </div>
                      {bank.verified && (
                        <span className="bg-[#006d37] text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">
                          GOVT VERIFIED
                        </span>
                      )}
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Stock Level:</span>
                        <span className={`font-bold text-sm ${bank.status === 'Critical' ? 'text-red-600' : bank.status === 'High' ? 'text-green-700' : 'text-blue-600'}`}>
                          {bank.status === 'Critical' ? '⚠️ Critical' : '✓ High'}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {Object.entries(bank.stocks).map(([grp, qty]) => (
                          <span 
                            key={grp} 
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              qty.includes('Urgent') ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700 border'
                            }`}
                          >
                            {grp} : {qty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => triggerCall(bank.phone)}
                      className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 font-bold text-xs"
                    >
                      📞 Call
                    </button>
                    <button 
                      onClick={() => handleRequest(bank.name)}
                      className="flex-1 bg-[#f37021] text-white py-2.5 rounded-xl hover:opacity-95 transition-all font-bold text-xs shadow-sm"
                    >
                      {bank.status === 'Critical' ? 'Donate Now' : 'Request'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Box: Volunteer Saving Track Forms */}
        <section className="px-10 py-16 bg-white max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#fcf9f8] p-8 rounded-2xl border border-[#eae7e7]">
              <h2 className="font-serif text-3xl font-bold mb-2 text-left">Register as a Life-Saver</h2>
              <p className="text-sm text-[#584237] mb-8 text-left">Join our network of 50,000+ volunteers. Your blood could save three lives.</p>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-[#1c1b1b]">Full Name</label>
                    <input 
                      type="text"
                      value={registration.fullName}
                      onChange={(e) => setRegistration({...registration, fullName: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#f37021]/20 text-sm focus:outline-none" 
                      placeholder="Nihal Nayak"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-[#1c1b1b]">Blood Group</label>
                    <select 
                      value={registration.bloodGroup}
                      onChange={(e) => setRegistration({...registration, bloodGroup: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#f37021]/20 text-sm focus:outline-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {bloodGroupsList.map(grp => <option key={grp} value={grp}>{grp}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-[#1c1b1b]">Contact Number</label>
                    <input 
                      type="tel"
                      value={registration.phone}
                      onChange={(e) => setRegistration({...registration, phone: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#f37021]/20 text-sm focus:outline-none" 
                      placeholder="9xxxxxxxxx"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-[#1c1b1b]">Last Donation</label>
                    <input 
                      type="date"
                      value={registration.lastDonation}
                      onChange={(e) => setRegistration({...registration, lastDonation: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-[#a04100]/5 rounded-xl border border-[#a04100]/10 text-left">
                  <input 
                    type="checkbox" 
                    checked={registration.agreed}
                    onChange={(e) => setRegistration({...registration, agreed: e.target.checked})}
                    className="mt-1 rounded text-[#a04100] focus:ring-[#a04100]"
                  />
                  <p className="text-xs text-[#584237] leading-relaxed">
                    I agree to receive urgent blood request notifications in my area and confirm that I meet the general eligibility criteria.
                  </p>
                </div>
                
                <button type="submit" className="w-full bg-[#f37021] text-white py-3.5 rounded-xl font-bold hover:opacity-95 shadow-md transition-all text-sm">
                  Submit Registration
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6 text-left">
              <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100 flex-1">
                <h3 className="font-serif text-lg font-bold text-[#007239] mb-3 flex items-center gap-1.5">
                  🛡️ Am I Eligible?
                </h3>
                <ul className="space-y-2.5 text-xs text-neutral-700 font-medium">
                  <li className="flex gap-2">✓ Weight above 50kg (110 lbs)</li>
                  <li className="flex gap-2">✓ Age between 18 and 65 years</li>
                  <li className="flex gap-2">✓ No chronic infections or illnesses</li>
                  <li className="flex gap-2">✓ Minimum 3 months since last donation</li>
                </ul>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex-1">
                <h3 className="font-serif text-lg font-bold text-[#003059] mb-2 flex items-center gap-1.5">
                  🌿 Ayurvedic Insight
                </h3>
                <p className="text-xs text-[#003059]/90 leading-relaxed font-medium">
                  Regular donation promotes <b>"Rakta Shuddhi"</b> (blood purification), stimulating the production of fresh cellular streams and effectively balancing the Kapha dosha.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default BloodBank;