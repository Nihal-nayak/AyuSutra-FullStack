import React, { useState, useEffect } from 'react';

function BloodBank() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('Bengaluru');
  const [bloodGroup, setBloodGroup] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  const districtsList = ['All Districts', 'Bengaluru', 'Mysuru', 'Belagavi', 'Tumakuru'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  useEffect(() => {
    setLoading(true);
    const searchDistrict = district === 'All Districts' ? '' : district;
    const url = `http://localhost:8080/api/blood_banks/search?district=${searchDistrict}&bloodGroup=${bloodGroup}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setBanks(data);
        setVisibleCount(9);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching blood banks:', err);
        setLoading(false);
      });
  }, [district, bloodGroup]);

  const visibleBanks = banks.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-brand-orange">Blood Banks</h2>
        <p className="text-gray-600 text-sm">Find critical blood stocks and emergency donors nearby</p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4">
        <select 
          value={bloodGroup} 
          onChange={(e) => setBloodGroup(e.target.value)}
          className="border p-2 rounded-lg text-sm bg-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-orange"
        >
          <option value="">All Blood Groups</option>
          {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
      </div>

      {/* District Buttons */}
      <div className="flex flex-wrap gap-2">
        {districtsList.map((d) => (
          <button
            key={d}
            onClick={() => setDistrict(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
              district === d ? 'bg-brand-orange text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Connecting to database...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleBanks.map((bank) => (
              <div key={bank.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg text-slate-800">{bank.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">📍 {bank.location || 'Karnataka'}</p>
                  <p className="text-xs bg-red-50 text-red-600 font-medium p-2 rounded-lg mt-3">ℹ️ {bank.notes}</p>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name)}`, '_blank')}
                    className="flex-1 bg-brand-orange text-white text-xs font-bold py-2.5 rounded-xl hover:bg-orange-700 transition"
                  >
                    Get Directions
                  </button>
                  <a 
                    href={`tel:${bank.phone || ''}`} 
                    className="px-4 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Trigger */}
          {banks.length > visibleCount && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 9)}
                className="px-6 py-2.5 border-2 border-brand-orange text-brand-orange text-sm font-bold rounded-xl hover:bg-brand-orange hover:text-white transition"
              >
                View More Centers
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BloodBank;