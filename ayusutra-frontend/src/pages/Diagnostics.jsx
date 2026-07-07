import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker assets in standard React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Diagnostics() {
  const PAGE_SIZE = 8;

  const [centers, setCenters] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Live Location Sync States
  const [userLat, setUserLat] = useState(12.9716); 
  const [userLng, setUserLng] = useState(77.5946); 
  const [locationStatus, setLocationStatus] = useState('Detecting location...');
  const [isTracking, setIsTracking] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  // UI Filter Input States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nabl, setNabl] = useState(false);
  const [homeCollection, setHomeCollection] = useState(false);
  const [availability, setAvailability] = useState(false);

  const categories = ['Radiology', 'Pathology', 'Cardiology', 'Wellness'];

  const formatDistance = (km) => {
    if (km == null) return null;
    if (km < 1) return `${Math.round(km * 1000)} m away`;
    return `${km.toFixed(1)} km away`;
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) return;

    setLocationStatus('Detecting location...');
    setLocationReady(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Pure, untouched real-time hardware coordinates
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLat(lat);
        setUserLng(lng);
        setIsTracking(true);
        setLocationReady(true);
        setPage(0);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.address) {
              const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential;
              const city = data.address.city || data.address.town || data.address.village;
              setLocationStatus(neighborhood && city ? `${neighborhood}, ${city}` : city || 'Current Location (Live)');
            } else {
              setLocationStatus('Current Location (Live)');
            }
          })
          .catch(() => setLocationStatus('Current Location (Live)'));
      },
      () => {
        setLocationStatus('Using Bengaluru (default)');
        setIsTracking(false);
        setLocationReady(true);
      },
      // Force hardware lookup with NO cache age configuration
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const openDirections = (center) => {
    const origin = `${userLat},${userLng}`;
    const destination = encodeURIComponent(
      [center.name, center.location, 'Bengaluru, Karnataka'].filter(Boolean).join(', ')
    );
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
  };

  // 1. Initial Page Load Geolocation Lock
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Bengaluru, KA (Default Fallback)');
      setLocationReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setIsTracking(true);
        setLocationReady(true);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.address) {
              const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.residential;
              const city = data.address.city || data.address.town || data.address.village;
              setLocationStatus(neighborhood && city ? `${neighborhood}, ${city}` : city || 'Current Location (Live)');
            } else {
              setLocationStatus('Current Location (Live)');
            }
          })
          .catch(() => setLocationStatus('Current Location (Live)'));
      },
      () => {
        setLocationStatus('Using Bengaluru (default)');
        setIsTracking(false);
        setLocationReady(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  const filterKey = [searchTerm, selectedCategory, nabl, homeCollection, availability, userLat, userLng].join('|');
  const lastFilterKey = useRef(filterKey);

  const buildSearchUrl = (pageNum) =>
    `http://localhost:8080/api/diagnostics?query=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(selectedCategory)}&nabl=${nabl}&homeCollection=${homeCollection}&availability=${availability}&userLat=${userLat}&userLng=${userLng}&page=${pageNum}&size=${PAGE_SIZE}`;

  useEffect(() => {
    if (!locationReady) {
      return;
    }

    const filtersChanged = lastFilterKey.current !== filterKey;
    if (filtersChanged) {
      lastFilterKey.current = filterKey;
      if (page !== 0) {
        setPage(0);
        return;
      }
    }

    const isLoadMore = page > 0;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    fetch(buildSearchUrl(page))
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const batch = data.centers || [];
        setTotalCount(data.total ?? batch.length);
        setHasMore(data.hasMore ?? false);
        setCenters((prev) => (isLoadMore ? [...prev, ...batch] : batch));
      })
      .catch((err) => {
        console.error('Database sync failed:', err);
        if (!isLoadMore) {
          setCenters([]);
          setTotalCount(0);
          setHasMore(false);
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [filterKey, page, locationReady]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  };

  const renderTestChips = (center) => {
    const notesStr = center.notes || '';
    const nameStr = (center.name || '').toLowerCase();
    const typeStr = (center.type || '').toLowerCase();

    // 1. Check if the notes actually contain real test names already
    if (notesStr && !notesStr.toLowerCase().includes('staff') && !notesStr.toLowerCase().includes('scans') && !notesStr.toLowerCase().includes('package')) {
      return notesStr.split(',').map(item => item.trim());
    }

    // 2. Dynamic Fallback: Generate real tests based on the lab's specialization name or type
    if (nameStr.includes('scan') || nameStr.includes('xray') || nameStr.includes('imaging') || notesStr.toLowerCase().includes('scans')) {
      return ['USG Abdomen', 'Chest X-Ray Digital', 'CT Brain Scan'];
    }
    if (nameStr.includes('heart') || nameStr.includes('cardio')) {
      return ['ECG Tracking', 'Echocardiography (2D Echo)', 'Treadmill Test (TMT)'];
    }
    if (nameStr.includes('pathology') || nameStr.includes('lab') || typeStr.includes('laboratory') || nameStr.includes('diagnostic')) {
      return ['Complete Blood Count (CBC)', 'Lipid Profile', 'HbA1c (Diabetes)'];
    }

    // 3. Absolute catch-all safety backup
    return ['Routine Blood Profile', 'Thyroid T3 T4 TSH', 'Urine Routine Analysis'];
  };

  return (
    <div className="space-y-12">
      <header className="mb-12">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-5xl text-primary mb-4 font-bold">Diagnostic Centers & Lab Tests</h1>
            <p className="text-lg font-sans text-on-surface-variant max-w-2xl leading-relaxed">
              Precision care meets Ayurvedic wisdom. Book NABL-accredited diagnostic tests with home sample collection options near you.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#e2f7eb] text-[#007239] font-sans font-bold text-xs px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span>Karnataka Govt. Database</span>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-grow flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-outline-variant focus-within:border-primary-container transition-all">
            <span className="material-symbols-outlined text-primary mr-4">biotech</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-base font-sans text-on-surface placeholder:text-on-surface-variant/50" 
              placeholder="Search for MRI, CBC, X-Ray or Lab names..." 
              type="text" 
            />
          </div>
          <div className="flex items-center bg-white rounded-2xl px-6 py-4 shadow-sm border border-outline-variant focus-within:border-primary-container transition-all min-w-[320px]">
            <span className={`w-2.5 h-2.5 rounded-full bg-green-500 mr-3 ${isTracking ? 'animate-pulse' : ''}`}></span>
            <input 
              value={locationStatus}
              readOnly
              className="bg-transparent border-none p-0 text-base font-sans font-semibold text-on-surface w-full focus:ring-0 cursor-default" 
              type="text" 
            />
          </div>
          <button
            type="button"
            onClick={refreshLocation}
            className="bg-primary-container text-white px-8 py-4 rounded-2xl font-sans font-bold hover:shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span className="material-symbols-outlined">my_location</span>
            <span>Near Me</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant">
            <h3 className="font-serif text-xl text-on-surface mb-6 flex items-center gap-2 border-b pb-3 font-bold">
              <span className="material-symbols-outlined">filter_list</span>
              <span>Filters</span>
            </h3>
            
            <div className="mb-8">
              <p className="font-sans text-sm font-bold text-on-surface mb-4">Center Type</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={nabl} onChange={(e) => setNabl(e.target.checked)} className="rounded border-outline text-primary focus:ring-primary h-5 w-5" />
                  <span className={`text-base font-sans ${nabl ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>NABL Accredited</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={homeCollection} onChange={(e) => setHomeCollection(e.target.checked)} className="rounded border-outline text-primary focus:ring-primary h-5 w-5" />
                  <span className={`text-base font-sans ${homeCollection ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Home Collection</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={availability} onChange={(e) => setAvailability(e.target.checked)} className="rounded border-outline text-primary focus:ring-primary h-5 w-5" />
                  <span className={`text-base font-sans ${availability ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>24/7 Availability</span>
                </label>
              </div>
            </div>

            <div>
              <p className="font-sans text-sm font-bold text-on-surface mb-4">Test Categories</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold transition font-sans ${selectedCategory === '' ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant' : 'border-outline-variant text-on-surface-variant'}`}
                >
                  All Labs
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                    className={`px-4 py-2 rounded-full border text-xs font-semibold transition font-sans ${selectedCategory === cat ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant' : 'border-outline-variant text-on-surface-variant'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-grow w-full space-y-8">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="font-serif text-3xl font-bold text-on-surface">
              {loading ? 'Reading Database...' : `${totalCount} Results Found`}
            </h2>
            {!loading && totalCount > 0 && (
              <p className="text-sm font-sans text-on-surface-variant">
                Showing {centers.length} of {totalCount} · Sorted by nearest
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centers.map((center) => (
              <div key={center.id} className="bg-white rounded-3xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary">{center.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-amber-700 font-bold font-sans mt-1">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span>{center.rating ? center.rating.toFixed(1) : '4.5'}</span>
                        <span className="text-on-surface-variant/50 font-normal">({center.reviews || '80'}+ Reviews)</span>
                      </div>
                    </div>
                    <span className="bg-[#f6f3f2] border text-on-surface-variant text-[10px] font-bold px-2.5 py-1 rounded-md font-sans tracking-wide uppercase">
                      {center.type && center.type.toLowerCase().includes('nabl') ? 'NABL LAB' : 'HOME LAB'}
                    </span>
                  </div>

                  <p className="flex items-start text-sm font-sans font-medium text-on-surface-variant gap-1.5 mt-4">
                    <span className="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
                    <span>
                      {center.location || 'Bengaluru'}
                      {center.distanceKm != null && (
                        <span className="ml-2 text-primary font-bold">· {formatDistance(center.distanceKm)}</span>
                      )}
                    </span>
                  </p>

                  <div className="mt-2 pl-6">
                    <button
                      type="button"
                      onClick={() => openDirections(center)}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-sans font-bold text-[10px] px-2.5 py-1 rounded tracking-wider uppercase hover:bg-slate-200 transition"
                    >
                      <span className="material-symbols-outlined text-xs">map</span>
                      <span>Google Maps Location</span>
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/60 font-sans">Tests Available</p>
                    <div className="flex flex-wrap gap-1.5">
                    {renderTestChips(center).slice(0, 3).map((test, index) => (
    <span key={index} className="bg-gray-100 text-gray-700 font-sans font-semibold text-xs px-2.5 py-1 rounded-md border">
      {test}
    </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2 border-t pt-4 border-dashed border-outline-variant/50 text-sm font-sans font-semibold text-on-surface-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">schedule</span>
                      <span>{center.status || '8AM - 8PM'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-base">call</span>
                      <a href={`tel:${center.phone || '08041155555'}`} className="hover:underline hover:text-primary transition-all">
                        {center.phone || '08041155555'}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-outline-variant/40 bg-gray-50/50 -mx-6 -mb-6 p-4">
                  <button
                    type="button"
                    onClick={() => openDirections(center)}
                    className="bg-primary text-white py-3 px-4 rounded-xl font-sans font-bold shadow-sm hover:brightness-95 transition flex items-center justify-center gap-1.5 text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">explore</span>
                    <span>Directions</span>
                  </button>
                  <a 
                    href={`tel:${center.phone || '08041155555'}`}
                    className="bg-white border border-outline-variant text-on-surface py-3 px-4 rounded-xl font-sans font-bold hover:bg-gray-50 transition flex items-center justify-center gap-1.5 text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {!loading && hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-white border-2 border-primary text-primary px-10 py-3.5 rounded-2xl font-sans font-bold hover:bg-primary-fixed transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-lg">
                  {loadingMore ? 'hourglass_empty' : 'expand_more'}
                </span>
                <span>{loadingMore ? 'Loading...' : 'Load More'}</span>
              </button>
            </div>
          )}

          {!loading && centers.length > 0 && (
            <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-sm border border-outline-variant/60 mt-8 z-10">
              <MapContainer center={[userLat, userLng]} zoom={12} scrollWheelZoom={false}>
                <TileLayer
                  attribution='© <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[userLat, userLng]}>
                  <Popup>
                    <div className="p-1 text-left font-sans text-xs">
                      <p className="font-bold text-primary text-sm">Your Location</p>
                      <p className="text-gray-500">{locationStatus}</p>
                    </div>
                  </Popup>
                </Marker>
                {centers.map((center) => (
                  center.latitude != null && center.longitude != null && (
                    <Marker key={center.id} position={[center.latitude, center.longitude]}>
                      <Popup>
                        <div className="p-1 text-left font-sans text-xs min-w-[150px]">
                          <p className="font-bold text-primary text-sm mb-1">{center.name}</p>
                          <p className="text-gray-500 font-medium">{center.location}</p>
                          {center.distanceKm != null && (
                            <p className="text-primary text-[10px] font-bold mt-1">{formatDistance(center.distanceKm)}</p>
                          )}
                          <p className="text-primary text-[10px] font-bold mt-1.5">{center.status || '8AM - 8PM'}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
              
              <div className="absolute bottom-6 left-6 z-[1000] max-w-xs pointer-events-none">
                <div className="bg-white p-5 rounded-2xl shadow-xl border border-outline-variant max-w-xs pointer-events-auto text-left space-y-2">
                  <h4 className="font-serif font-bold text-on-surface text-base">Interactive Map View</h4>
                  <p className="text-xs text-on-surface-variant font-sans leading-relaxed">Explore proximity diagnostic centers live in your current vicinity.</p>
                  <button
                    type="button"
                    onClick={() => openDirections(centers[0])}
                    className="w-full bg-primary-container text-white py-2.5 rounded-xl font-sans font-bold hover:brightness-95 transition-all text-xs text-center"
                  >
                    Open Fullscreen Map
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Diagnostics;