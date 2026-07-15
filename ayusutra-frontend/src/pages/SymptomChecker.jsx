import React, { useState } from 'react';

const COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Chest Pain', 'Cough', 'Stomach Pain', 'Joint Pain'
];

const DOCTOR_GUIDE = [
  {
    key: 'GENERAL',
    title: 'General Physician',
    desc: 'First point of care for fever, cough, and general illness.',
    icon: 'person',
  },
  {
    key: 'INFECTIOUS',
    title: 'Infectious Disease Specialist',
    desc: 'For dengue, malaria, typhoid and other infections.',
    icon: 'biotech',
  },
  {
    key: 'NEUROLOGY',
    title: 'Neurologist',
    desc: 'For persistent headache, migraine, or dizziness.',
    icon: 'neurology',
  },
  {
    key: 'CARDIOLOGY',
    title: 'Cardiologist',
    desc: 'For chest pain, breathlessness, or heart-related symptoms.',
    icon: 'cardiology',
  },
];

function conditionsFromInput(symptoms, predictedDisease) {
  const text = (symptoms || '').toLowerCase();
  const set = new Set();
  if (predictedDisease) set.add(predictedDisease);

  if (text.includes('fever') || text.includes('cough')) {
    ['Viral Fever', 'Malaria', 'Dengue', 'Typhoid', 'COVID-19'].forEach((c) => set.add(c));
  }
  if (text.includes('headache') || text.includes('migraine') || text.includes('dizzy')) {
    ['Tension Headache', 'Migraine', 'Sinusitis'].forEach((c) => set.add(c));
  }
  if (text.includes('chest') || text.includes('breath') || text.includes('heart')) {
    ['Angina', 'Anxiety Attack', 'Acid Reflux'].forEach((c) => set.add(c));
  }
  if (text.includes('stomach') || text.includes('nausea') || text.includes('vomit')) {
    ['Gastritis', 'Food Poisoning', 'IBS'].forEach((c) => set.add(c));
  }
  if (text.includes('joint') || text.includes('pain')) {
    ['Arthritis', 'Viral Myalgia'].forEach((c) => set.add(c));
  }
  if (set.size <= 1) {
    ['General Fatigue', 'Seasonal Allergy', 'Dehydration'].forEach((c) => set.add(c));
  }
  return Array.from(set).slice(0, 5);
}

function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const [duration, setDuration] = useState(3);
  const [painLevel, setPainLevel] = useState(2);
  const [frequency, setFrequency] = useState(3);
  const [impact, setImpact] = useState(2);

  const getDurationLabel = (val) => {
    if (val <= 1) return 'Less than a day';
    if (val <= 2) return '1–3 days';
    if (val <= 3) return '3–7 days';
    if (val <= 4) return '1–2 weeks';
    return '2 weeks+';
  };

  const getPainLabel = (val) => {
    if (val <= 1) return 'None';
    if (val <= 2) return 'Mild';
    if (val <= 3) return 'Moderate';
    if (val <= 4) return 'Strong';
    return 'Severe';
  };

  const getFrequencyLabel = (val) => {
    if (val <= 1) return 'Rarely';
    if (val <= 2) return 'Occasional';
    if (val <= 3) return 'Intermittent';
    if (val <= 4) return 'Frequent';
    return 'Constant';
  };

  const getImpactLabel = (val) => {
    if (val <= 1) return 'Minimal';
    if (val <= 2) return 'Mild';
    if (val <= 3) return 'Noticeable';
    if (val <= 4) return 'Significant';
    return 'Severe';
  };

  const handleAddTag = (tag) => {
    setSymptoms((prev) => {
      const clean = prev.trim();
      if (!clean) return tag;
      if (clean.toLowerCase().includes(tag.toLowerCase())) return prev;
      return `${clean}, ${tag}`;
    });
  };

  const handleClearAll = () => {
    setSymptoms('');
    setDuration(3);
    setPainLevel(2);
    setFrequency(3);
    setImpact(2);
    setAnalysis(null);
  };

  const sendAnalysisRequest = (payload) => {
    fetch('http://localhost:8080/api/symptoms/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        const totalScore = Math.round(((duration + painLevel + frequency + impact) / 20) * 100);

        let severityText = 'Moderate — Moderate — Visit a doctor soon';
        let severityColor = 'bg-[#FDEFE6] text-[#A04100] border-[#F37021]/20';
        if (totalScore >= 75) {
          severityText = 'High — Emergency evaluation advised';
          severityColor = 'bg-red-50 text-red-700 border-red-200';
        } else if (totalScore < 40) {
          severityText = 'Mild — Mild — Monitor at home';
          severityColor = 'bg-[#FFF9E6] text-[#D97706] border-[#FFEBAA]';
        }

        setTimeout(() => {
          setAnalysis({
            ...data,
            severityScore: totalScore,
            severityText,
            severityColor,
            breakdown: { duration, painLevel, frequency, impact },
            conditions: conditionsFromInput(symptoms, data.predictedDisease),
          });
          setLoading(false);
        }, 900);
      })
      .catch((err) => {
        console.error(err);
        alert('Diagnostic server connection timeout.');
        setLoading(false);
      });
  };

  const handleAnalyze = (e) => {
    if (e) e.preventDefault();
    if (!symptoms.trim()) {
      alert('Please enter or select some symptoms.');
      return;
    }

    setLoading(true);

    const buildPayload = (lat, lng) => ({
      symptoms,
      duration,
      painLevel,
      frequency,
      impact,
      latitude: lat,
      longitude: lng,
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendAnalysisRequest(buildPayload(pos.coords.latitude, pos.coords.longitude)),
        () => sendAnalysisRequest(buildPayload(12.9716, 77.5946)),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendAnalysisRequest(buildPayload(12.9716, 77.5946));
    }
  };

  const openDirections = (hospital) => {
    const lat = hospital.latitude;
    const lng = hospital.longitude;
    if (lat != null && lng != null) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      const query = encodeURIComponent(hospital.name || hospital.location || 'hospital');
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const ScoreBar = ({ label, value }) => (
    <div className="flex items-center gap-4">
      <span className="w-28 text-xs text-[#584237]/70 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#EAE8E4] rounded-full overflow-hidden">
        <div className="h-full bg-[#f37021] rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-bold w-8 text-right text-[#1c1b1b]">{value}/5</span>
    </div>
  );

  return (
    <div className="text-[#1c1b1b] w-full">
      <header className="mb-10 text-left">
        <h1 className="font-serif text-4xl font-bold text-[#1c1b1b] mb-2">Symptom Checker</h1>
        <p className="text-[#584237]/70 text-sm">
          Scored analysis <span className="mx-1">→</span> conditions <span className="mx-1">→</span> specialist guide{' '}
          <span className="mx-1">→</span> nearest hospitals
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: input */}
        <section className="lg:col-span-7">
          <div className="bg-white border border-[#e0c0b2]/30 rounded-2xl p-8 shadow-sm text-left">
            <h2 className="font-bold text-base mb-4 text-[#1c1b1b]">Your Symptoms</h2>

            <div className="relative mb-4">
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Type a symptom, press Enter..."
                className="w-full bg-[#f6f3f2] border border-[#e0c0b2]/20 rounded-xl px-5 py-4 text-base focus:ring-1 focus:ring-[#f37021] outline-none placeholder:text-[#584237]/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAnalyze(e);
                }}
              />
              <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#584237]/60">
                search
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs font-bold text-[#584237]/60 uppercase mr-1">Common:</span>
              {COMMON_SYMPTOMS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                    symptoms.toLowerCase().includes(tag.toLowerCase())
                      ? 'bg-[#a04100]/10 border-[#a04100]/40 text-[#a04100] font-semibold'
                      : 'bg-[#f6f3f2] border-[#e0c0b2]/30 text-[#1c1b1b] hover:bg-[#a04100]/5'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="pt-8 border-t border-[#e0c0b2]/20">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-[#a04100] text-xl">bar_chart</span>
                <h2 className="text-sm font-bold text-[#1c1b1b]">
                  Symptom Severity Factors{' '}
                  <span className="font-normal text-[#584237]/60">(adjust to get accurate score)</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#1c1b1b]">
                    Duration: <span className="text-[#f37021]">{getDurationLabel(duration)}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full accent-[#f37021]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#1c1b1b]">
                    Pain Level: <span className="text-[#f37021]">{getPainLabel(painLevel)}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value, 10))}
                    className="w-full accent-[#f37021]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#1c1b1b]">
                    Frequency: <span className="text-[#f37021]">{getFrequencyLabel(frequency)}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={frequency}
                    onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
                    className="w-full accent-[#f37021]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#1c1b1b]">
                    Impact on daily life: <span className="text-[#f37021]">{getImpactLabel(impact)}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={impact}
                    onChange={(e) => setImpact(parseInt(e.target.value, 10))}
                    className="w-full accent-[#f37021]"
                  />
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-10 py-3.5 bg-[#f37021] text-white font-bold rounded-full shadow-md hover:opacity-90 transition-all text-sm disabled:opacity-60"
                >
                  {loading ? 'Analyzing…' : 'Analyze Symptoms'}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-10 py-3.5 bg-white border border-[#e0c0b2] text-[#1c1b1b] font-bold rounded-full hover:bg-[#f6f3f2] transition-all text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: results */}
        <section className="lg:col-span-5 space-y-6">
          {loading && (
            <div className="bg-white border border-[#eae7e7] rounded-2xl p-16 shadow-sm text-center flex flex-col items-center justify-center space-y-4 min-h-[360px]">
              <div className="w-10 h-10 border-4 border-neutral-100 border-t-[#f37021] rounded-full animate-spin" />
              <p className="text-xs font-bold text-neutral-400">Running diagnostic keywords...</p>
            </div>
          )}

          {!loading && !analysis && (
            <div className="bg-[#f6f3f2] p-12 rounded-2xl border border-[#eae7e7] text-center flex flex-col items-center justify-center min-h-[360px]">
              <span className="material-symbols-outlined text-5xl text-[#584237]/35 mb-3">medical_information</span>
              <h4 className="font-serif font-bold text-lg text-[#1c1b1b]">Diagnostic Engine Ready</h4>
              <p className="text-xs text-[#584237]/60 max-w-xs mt-2 leading-relaxed">
                Please describe your symptoms and click Analyze to review the score metrics.
              </p>
            </div>
          )}

          {!loading && analysis && (
            <div className="space-y-6">
              <div className="bg-[#F8F5F2] p-7 rounded-2xl border border-[#E9E4DE] text-left">
                <div
                  className={`inline-block px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest mb-6 border ${analysis.severityColor}`}
                >
                  {analysis.severityText}
                </div>

                <h3 className="text-xs font-bold text-[#584237]/40 uppercase tracking-wider mb-4">
                  Severity Score Breakdown
                </h3>

                <div className="space-y-4">
                  <ScoreBar label="Duration" value={analysis.breakdown.duration} />
                  <ScoreBar label="Pain Level" value={analysis.breakdown.painLevel} />
                  <ScoreBar label="Frequency" value={analysis.breakdown.frequency} />
                  <ScoreBar label="Daily Impact" value={analysis.breakdown.impact} />
                </div>

                <div className="flex items-end justify-between pt-8 mt-6 border-t border-[#e0c0b2]/15">
                  <div>
                    <span className="text-[56px] font-serif text-[#a04100] leading-none block">
                      {analysis.severityScore}
                    </span>
                    <span className="text-xs text-[#584237]/60">/100 severity score</span>
                  </div>
                  <p className="text-right text-xs text-[#584237]/60 max-w-[150px] leading-snug">
                    Elevated due to multiple symptoms
                  </p>
                </div>
              </div>

              <div className="text-left">
                <h3 className="text-xs font-bold text-[#584237]/40 uppercase tracking-widest mb-3">
                  Possible Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.conditions.map((c) => (
                    <span
                      key={c}
                      className="px-4 py-2 bg-white rounded-full border border-[#e0c0b2]/30 text-sm font-semibold shadow-sm text-[#1c1b1b]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#F2FBF6] border border-[#D5EFE1] p-6 rounded-2xl text-left">
                <div className="flex items-center gap-2 mb-5 text-[#006d37]">
                  <span className="material-symbols-outlined text-xl">lightbulb</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest">Which Doctor Should You See?</h3>
                </div>

                <div className="space-y-3">
                  {DOCTOR_GUIDE.map((doc) => {
                    const specialty = (analysis.targetedSpeciality || '').toUpperCase();
                    const isPrimary =
                      (doc.key === 'CARDIOLOGY' && specialty.includes('CARDIO')) ||
                      (doc.key === 'NEUROLOGY' && specialty.includes('NEURO')) ||
                      (doc.key === 'GENERAL' && (specialty.includes('GENERAL') || !specialty));

                    return (
                      <div
                        key={doc.key}
                        className={`flex items-center gap-4 p-3.5 rounded-xl ${
                          isPrimary ? 'bg-white shadow-sm ring-1 ring-[#006d37]/15' : 'bg-white/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#006d37]">
                          <span className="material-symbols-outlined text-xl">{doc.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1c1b1b]">
                            {doc.title}
                            {isPrimary && (
                              <span className="ml-2 text-[9px] uppercase tracking-wide text-[#006d37] font-bold">
                                Recommended
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#584237]/70">{doc.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {!loading && analysis?.recommendedHospitals?.length > 0 && (
        <section className="mt-20 text-left">
          <h3 className="text-xs font-bold text-[#584237]/40 uppercase tracking-widest mb-8">
            Nearest Hospitals for your condition
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.recommendedHospitals.map((hospital, idx) => (
              <div
                key={hospital.id || idx}
                className={`bg-white p-6 rounded-2xl shadow-sm border border-[#eae7e7] border-t-[6px] flex flex-col h-full hover:-translate-y-1 transition-all duration-300 ${
                  idx === 1 ? 'border-t-[#3b82f6]' : 'border-t-[#f37021]'
                }`}
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <h4 className="font-bold text-lg text-[#1c1b1b] leading-snug">{hospital.name}</h4>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider shrink-0">
                    Govt DB
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-[#f37021] mb-4">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                  <span className="material-symbols-outlined text-sm">star_half</span>
                  <span className="ml-2 text-xs text-[#584237]/60 font-medium">
                    {hospital.rating || '4.5'} (1.2k reviews)
                  </span>
                </div>

                <p className="text-xs text-[#584237]/80 mb-5 flex items-start gap-2 leading-relaxed">
                  <span className="material-symbols-outlined text-[#a04100] text-lg shrink-0">location_on</span>
                  {hospital.address || hospital.location || hospital.district || 'Bangalore'}
                </p>

                {(hospital.specialties || analysis.targetedSpeciality) && (
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-[#584237]/50 uppercase tracking-wider mb-2">
                      Specialties Available
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(hospital.specialties || analysis.targetedSpeciality || 'General Medicine')
                        .split(',')
                        .slice(0, 4)
                        .map((spec) => (
                          <span
                            key={spec}
                            className="bg-[#FFF1E6] text-[#A04100] text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wide"
                          >
                            {spec.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto flex gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => openDirections(hospital)}
                    className="flex-1 py-3 bg-[#f37021] hover:bg-[#d46a4f] text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Book Appointment
                  </button>
                  <a
                    href={`tel:${hospital.phoneNumber || '0802221111'}`}
                    className="p-3 bg-[#f6f3f2] text-[#584237] border border-[#e0c0b2]/30 rounded-xl hover:bg-[#e5e2e1] transition-all flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-20 p-10 rounded-2xl bg-[#FFF9E6] border border-[#FFD966]/40 text-center">
        <p className="text-xs text-[#856404] uppercase font-bold tracking-widest mb-4">Medical Disclaimer</p>
        <p className="text-sm text-[#584237]/80 max-w-3xl mx-auto leading-relaxed">
          AyuSutra&apos;s Symptom Checker is for informational purposes only and is not a substitute for professional
          medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health
          provider with any questions you may have regarding a medical condition.
        </p>
      </div>
    </div>
  );
}

export default SymptomChecker;
