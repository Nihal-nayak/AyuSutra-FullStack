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
  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  
  // Filtering & Input form states
  const [selectedGroup, setSelectedGroup] = useState('Select Blood Type');
  const [locationSearch, setLocationSearch] = useState('');
  
  // Registration Form state
  const [registration, setRegistration] = useState({
    fullName: '',
    bloodGroup: '',
    phone: '',
    lastDonation: '',
    agreed: false
  });

  // Pure Live Precision Location Sync Hook
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Bengaluru (Default)');
      loadMockData(12.9716, 77.5946);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.address) {
              const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential || 'Sathnuru';
              const city = data.address.city || data.address.town || 'Bengaluru';
              setLocationStatus(`${neighborhood}, ${city}`);
            } else {
              setLocationStatus('Live Coordinates Connected');
            }
          })
          .catch(() => setLocationStatus('Live Coordinates Connected'));

        loadMockData(lat, lng);
      },
      () => {
        setLocationStatus('Using Bengaluru default routing node');
        loadMockData(12.9716, 77.5946);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Simulates or processes active blood network nodes centered around your position
  const loadMockData = (lat, lng) => {
    setLoading(true);
    // In production, this can hit your Spring Boot endpoint: /api/blood-banks?lat=X&lng=Y
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
      <main class="pt-12 flex-grow">
        {/* Hero Section with Mini Map Option */}
        <section class="relative px-10 py-16 overflow-hidden max-w-[1280px] mx-auto">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 class="font-serif text-5xl font-bold text-[#1c1b1b] mb-6 leading-tight">
                Lifesaving Care, <br/><span class="text-[#a04100]">Instantly Connected.</span>
              </h1>
              <p class="text-lg text-[#584237] max-w-lg mb-8 leading-relaxed">
                Real-time blood availability tracking across our verified partner network. Bridging Ayurvedic wellness and modern emergency diagnostics.
              </p>
              
              <div class="bg-white p-3 rounded-2xl shadow-sm flex flex-col md:flex-row gap-2 border border-[#eae7e7]">
                <div class="flex-1 px-4 py-2 border-r border-[#e0c0b2] flex items-center gap-3">
                  <span class="material-symbols-outlined text-[#a04100]">bloodtype</span>
                  <select 
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    class="bg-transparent border-none focus:ring-0 w-full font-semibold text-sm"
                  >
                    <option>Select Blood Type</option>
                    <option>A+</option><option>A-</option>
                    <option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option>
                    <option>AB+</option><option>AB-</option>
                  </select>
                </div>
                <div class="flex-1 px-4 py-2 flex items-center gap-3">
                  <span class="material-symbols-outlined text-[#a04100]">location_on</span>
                  <input 
                    value={locationStatus}
                    readOnly
                    class="bg-transparent border-none focus:ring-0 w-full font-semibold text-sm text-gray-600" 
                    type="text"
                  />
                </div>
                <button class="bg-[#f37021] text-white px-8 py-4 rounded-xl font-bold hover:opacity-95 transition-all shadow-md active:scale-95 text-sm">
                  Search Now
                </button>
              </div>
            </div>

            {/* LIVE MAP CONTAINER REPLACE */}
            <div class="w-full h-[400px] rounded-2xl overflow-hidden border border-[#e0c0b2] shadow-sm relative z-10">
              <MapContainer center={[userLat, userLng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='© <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[userLat, userLng]}>
                  <Popup>
                    <div className="p-1 text-left font-sans text-xs">
                      <p className="font-bold text-[#a04100]">Your Location</p>
                      <p className="text-gray-500">{locationStatus}</p>
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
        <section class="bg-[#f6f3f2] px-10 py-16">
          <div class="max-w-[1280px] mx-auto">
            <div class="flex justify-between items-end mb-12">
              <div>
                <h2 class="font-serif text-3xl font-bold text-[#1c1b1b] mb-2">Verified Blood Banks</h2>
                <p class="text-[#584237] text-sm">Showing results near your active position tracking boundary</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bloodBanks.map((bank) => (
                <div 
                  key={bank.id} 
                  className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 ${
                    bank.status === 'Critical' ? 'border-red-600' : bank.status === 'High' ? 'border-green-600' : 'border-blue-500'
                  }`}
                >
                  <div>
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <h3 class="font-serif text-xl font-bold text-[#1c1b1b] leading-tight">{bank.name}</h3>
                        <p class="text-xs text-[#584237] flex items-center gap-1 mt-1 font-semibold">
                          🧭 {bank.distance} km away
                        </p>
                      </div>
                      {bank.verified && (
                        <span class="bg-[#006d37] text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase">
                          GOVT VERIFIED
                        </span>
                      )}
                    </div>

                    <div class="space-y-4 mb-6">
                      <div class="flex items-center justify-between text-sm">
                        <span class="font-medium text-gray-600">Stock Level:</span>
                        <span class={`font-bold text-sm ${bank.status === 'Critical' ? 'text-red-600' : bank.status === 'High' ? 'text-green-700' : 'text-blue-600'}`}>
                          {bank.status === 'Critical' ? '⚠️ Critical' : '✓ High'}
                        </span>
                      </div>
                      <div class="flex gap-1.5 flex-wrap">
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

                  <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => triggerCall(bank.phone)}
                      class="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 font-bold text-xs"
                    >
                      📞 Call
                    </button>
                    <button 
                      onClick={() => handleRequest(bank.name)}
                      class="flex-1 bg-[#f37021] text-white py-2.5 rounded-xl hover:opacity-95 transition-all font-bold text-xs shadow-sm"
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
        <section class="px-10 py-16 bg-white max-w-[1280px] mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-7 bg-[#fcf9f8] p-8 rounded-2xl border border-[#eae7e7]">
              <h2 class="font-serif text-3xl font-bold mb-2">Register as a Life-Saver</h2>
              <p class="text-sm text-[#584237] mb-8">Join our network of 50,000+ volunteers. Your blood could save three lives.</p>
              
              <form onSubmit={handleRegister} class="space-y-4">
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="space-y-1 text-left">
                    <label class="text-xs font-bold text-[#1c1b1b]">Full Name</label>
                    <input 
                      type="text"
                      value={registration.fullName}
                      onChange={(e) => setRegistration({...registration, fullName: e.target.value})}
                      class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#f37021]/20 text-sm focus:outline-none" 
                      placeholder="Nihal Nayak"
                    />
                  </div>
                  <div class="space-y-1 text-left">
                    <label class="text-xs font-bold text-[#1c1b1b]">Blood Group</label>
                    <select 
                      value={registration.bloodGroup}
                      onChange={(e) => setRegistration({...registration, bloodGroup: e.target.value})}
                      class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#f37021]/20 text-sm"
                    >
                      <option value="">Select</option>
                      <option>O-</option><option>O+</option>
                      <option>A+</option><option>B+</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="space-y-1 text-left">
                    <label class="text-xs font-bold text-[#1c1b1b]">Contact Number</label>
                    <input 
                      type="tel"
                      value={registration.phone}
                      onChange={(e) => setRegistration({...registration, phone: e.target.value})}
                      class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#f37021]/20 text-sm" 
                      placeholder="9xxxxxxxxx"
                    />
                  </div>
                  <div class="space-y-1 text-left">
                    <label class="text-xs font-bold text-[#1c1b1b]">Last Donation</label>
                    <input 
                      type="date"
                      value={registration.lastDonation}
                      onChange={(e) => setRegistration({...registration, lastDonation: e.target.value})}
                      class="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 text-sm"
                    />
                  </div>
                </div>

                <div class="flex items-start gap-3 p-4 bg-[#a04100]/5 rounded-xl border border-[#a04100]/10 text-left">
                  <input 
                    type="checkbox" 
                    checked={registration.agreed}
                    onChange={(e) => setRegistration({...registration, agreed: e.target.checked})}
                    class="mt-1 rounded text-[#a04100] focus:ring-[#a04100]"
                  />
                  <p class="text-xs text-[#584237] leading-relaxed">
                    I agree to receive urgent blood request notifications in my area and confirm that I meet the general eligibility criteria.
                  </p>
                </div>
                
                <button type="submit" class="w-full bg-[#f37021] text-white py-3.5 rounded-xl font-bold hover:opacity-95 shadow-md transition-all text-sm">
                  Submit Registration
                </button>
              </form>
            </div>

            <div class="lg:col-span-5 flex flex-col gap-6 text-left">
              <div class="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100 flex-1">
                <h3 class="font-serif text-lg font-bold text-[#007239] mb-3 flex items-center gap-1.5">
                  🛡️ Am I Eligible?
                </h3>
                <ul class="space-y-2.5 text-xs text-neutral-700 font-medium">
                  <li class="flex gap-2">✓ Weight above 50kg (110 lbs)</li>
                  <li class="flex gap-2">✓ Age between 18 and 65 years</li>
                  <li class="flex gap-2">✓ No chronic infections or illnesses</li>
                  <li class="flex gap-2">✓ Minimum 3 months since last donation</li>
                </ul>
              </div>

              <div class="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex-1">
                <h3 class="font-serif text-lg font-bold text-[#003059] mb-2 flex items-center gap-1.5">
                  🌿 Ayurvedic Insight
                </h3>
                <p class="text-xs text-[#003059]/90 leading-relaxed font-medium">
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