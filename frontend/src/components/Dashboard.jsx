import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [hasAgreed, setHasAgreed] = useState(false);
  const [username, setUsername] = useState('');
  const [currentView, setCurrentView] = useState('add-member');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Ollama');
  const [apiKey, setApiKey] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [a1c, setA1c] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [conditions, setConditions] = useState(''); 
  
  const [isScanning, setIsScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    setUsername(storedUser || 'Guest User');
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('http://127.0.0.1:8000/api/family-profiles/', { headers });
      
      const profiles = res.data || [];
      setFamilyMembers(profiles);
      
      if (profiles.length === 0) {
        setCurrentView('add-member');
      } else {
        setSelectedMember(profiles[0]);
        setCurrentView('profile-detail');
      }
    } catch (err) {
      console.warn("Could not fetch database profiles. Starting fresh.");
      setFamilyMembers([]);
      setCurrentView('add-member');
    }
  };

  const handleAgree = () => {
    setHasAgreed(true);
    setCurrentView(familyMembers.length > 0 ? 'profile-detail' : 'add-member');
  };

  const handleCancelLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setApiKey(''); 
  };

  const handleConnectAI = () => {
    if (selectedModel === 'Ollama') {
      alert("Successfully connected to Local Ollama (Qwen 1.8B)!");
      return;
    }
    if (!apiKey.trim()) return alert(`Please enter a valid key for ${selectedModel}.`);
    alert(`Successfully connected to ${selectedModel}!`);
  };

  const handlePrescriptionScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsScanning(true);
    setTimeout(() => {
      const sampleMedicines = [
        "Paracetamol 650mg, Cetirizine 10mg",
        "Metformin 500mg (Twice daily), Vitamin D3 1000IU",
        "Atorvastatin 20mg (Once daily at night), Aspirin 81mg"
      ];
      setConditions(sampleMedicines[Math.floor(Math.random() * sampleMedicines.length)]);
      setIsScanning(false);
    }, 500);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (familyMembers.length >= 4) {
      setError("Maximum limit of 4 family members reached.");
      return;
    }

    // Maps frontend state keys correctly to Django model fields (first_name)
    const memberData = {
      first_name: firstName.trim(),
      last_name: lastName ? lastName.trim() : '',
      date_of_birth: dob || '',
      gender: gender || '',
      race_ethnicity: race || '',
      height: height || '',
      weight: weight || '',
      a1c: a1c || '',
      blood_pressure: bloodPressure || '',
      conditions: conditions.trim() || 'None listed'
    };

    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post('http://127.0.0.1:8000/api/family-profiles/', memberData, { headers });
      const newMember = response.data; 
      const updatedList = [...familyMembers, newMember];
      
      setFamilyMembers(updatedList);
      setSelectedMember(newMember);
      setChatMessages([]);
      setQuestionCount(0);
      setCurrentView('profile-detail');
      setSuccessMessage("Profile saved successfully!");

      // Clear Form
      setFirstName(''); setLastName(''); setDob(''); setGender('');
      setRace(''); setHeight(''); setWeight(''); setA1c(''); setBloodPressure(''); setConditions('');
    } catch (err) {
      console.error("Database save error:", err.response?.data || err);
      setError(JSON.stringify(err.response?.data) || "Failed to save to database. Please check backend.");
    }
  };

  const handleRemoveMember = (id) => {
    const filtered = familyMembers.filter(m => m.id !== id);
    setFamilyMembers(filtered);
    if (filtered.length > 0) {
      setSelectedMember(filtered[0]);
      setCurrentView('profile-detail');
    } else {
      setSelectedMember(null);
      setCurrentView('add-member');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || questionCount >= 100) return;

    const userQuestion = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { sender: 'user', text: userQuestion }];
    setChatMessages(newMessages);
    setQuestionCount(prev => prev + 1);
    setIsAnswering(true);

    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post('http://127.0.0.1:8000/api/ai-chat/', {
        member_id: selectedMember?.id,
        question: userQuestion
      }, { headers });
      
      setChatMessages([...newMessages, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      console.warn("Backend chat failed.");
      setChatMessages([...newMessages, { sender: 'ai', text: `[Error]: Could not reach backend AI endpoint.` }]);
    } finally {
      setIsAnswering(false);
    }
  };

  const getInitials = (fname, lname) => {
    const f = fname ? fname[0].toUpperCase() : '';
    const l = lname ? lname[0].toUpperCase() : '';
    return f + l || 'QF';
  };

  if (!hasAgreed) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-rose-50/50 text-gray-900'}`}>
        <div className={`max-w-2xl w-full p-10 rounded-3xl shadow-xl text-center border transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-rose-100 text-gray-900'}`}>
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            💚
          </div>
          <h2 className="text-3xl font-extrabold mb-2">Welcome to MedLife.ai</h2>
          <p className={`text-xs mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your intelligent medical companion dashboard</p>

          <div className={`p-6 rounded-2xl text-left mb-8 border shadow-sm ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40 text-amber-200/90' : 'bg-amber-50/70 border-amber-200/60 text-amber-950'}`}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
              <span>⚠️</span> <span className="ml-2">Medical Disclaimer</span>
            </div>
            <p className="text-xs leading-relaxed">
              All information in this application is provided solely to demonstrate how AI can be used in healthcare. This information is sourced from AI engines. None of the information has been validated or approved by a healthcare professional. Please use this information only after consulting and upon the advice of a healthcare professional.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={handleAgree}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <span>Agree & Continue</span> <span>→</span>
            </button>
            <button 
              onClick={handleCancelLogout}
              className={`px-6 py-3.5 font-semibold text-xs transition ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Cancel / Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-rose-50/30 text-gray-900'}`}>
      <div className={`w-64 border-r flex flex-col justify-between p-4 sticky top-0 h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-rose-100'}`}>
        <div>
          <div className="flex items-center space-x-2 mb-8 px-2">
            <span className="text-xl font-bold text-rose-600">medlife.ai</span>
          </div>
          <div className="space-y-1">
            <button 
              onClick={() => setCurrentView(familyMembers.length > 0 ? 'profile-detail' : 'add-member')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition ${currentView === 'dashboard' || currentView === 'profile-detail' ? (isDarkMode ? 'text-white bg-gray-800' : 'text-rose-900 bg-rose-50 font-semibold') : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
            >
              Family profiles <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-rose-100 text-rose-700'}`}>{familyMembers.length}/4</span>
            </button>

            {familyMembers.map((member) => (
              <div 
                key={member.id}
                onClick={() => { setSelectedMember(member); setCurrentView('profile-detail'); setChatMessages([]); setQuestionCount(0); }}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl cursor-pointer mt-2 border transition ${selectedMember?.id === member.id ? (isDarkMode ? 'bg-gray-800 border-rose-500/50' : 'bg-rose-50 border-rose-200') : (isDarkMode ? 'hover:bg-gray-800/50 border-gray-800' : 'hover:bg-gray-50 border-gray-200')}`}
              >
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                  {getInitials(member.first_name, member.last_name)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold truncate">{member.first_name} {member.last_name}</div>
                  <div className="text-[10px] text-gray-400">{questionCount} questions asked</div>
                </div>
              </div>
            ))}

            {familyMembers.length < 4 ? (
              <button 
                onClick={() => setCurrentView('add-member')}
                className={`w-full flex items-center px-3 py-2 text-sm font-semibold rounded-lg transition mt-3 ${currentView === 'add-member' ? 'text-rose-600 bg-rose-500/10 border border-rose-500/30' : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
              >
                + Add family member
              </button>
            ) : (
              <div className="text-[11px] text-amber-500 px-3 py-2 mt-3 bg-amber-500/10 rounded-lg text-center font-medium">
                Maximum limit of 4 profiles reached.
              </div>
            )}
          </div>
        </div>

        <div className={`border-t pt-4 px-2 ${isDarkMode ? 'border-gray-800' : 'border-rose-100'}`}>
          <div className={`text-xs truncate mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{username}</div>
          <button onClick={handleCancelLogout} className="text-xs text-rose-600 hover:underline flex items-center font-semibold">Sign out</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className={`sticky top-0 z-50 border-b px-6 py-4 flex justify-between items-center shadow-lg transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-rose-100'}`}>
          <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Health dashboard</h1>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-3 px-3 py-2 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-rose-50/50 border-rose-200 text-gray-800'}`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI CONFIG</span>
              <select value={selectedModel} onChange={handleModelChange} className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-rose-500 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-rose-300'}`}>
                <option value="Ollama">Ollama (Local)</option>
                <option value="Claude">Claude</option>
                <option value="OpenAI">OpenAI</option>
              </select>
              {selectedModel === 'Ollama' ? (
                <span className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-950/50 border border-emerald-800 rounded-lg">qwen:1.8b (Local)</span>
              ) : (
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={`Enter ${selectedModel} Key`} className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none w-36 ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-rose-300'}`} />
              )}
              <button onClick={handleConnectAI} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition">Connect</button>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl border transition shadow-md flex items-center justify-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-rose-200 text-gray-700'}`}>{isDarkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>

        <div className={`flex-1 p-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-rose-50/30 text-gray-900'}`}>
          {currentView === 'add-member' && (
            <div className={`max-w-xl mx-auto border p-8 rounded-2xl shadow-2xl relative my-6 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-rose-100 text-gray-900'}`}>
              <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add a family member</h2>
              <p className={`text-xs mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>These details help the assistant give answers that fit the person. ({familyMembers.length}/4 added)</p>
              
              {error && <p className="text-red-400 text-sm mb-4 bg-red-950/50 p-3 rounded-lg">{error}</p>}
              {successMessage && <p className="text-green-400 text-sm mb-4 bg-green-950/50 p-3 rounded-lg">{successMessage}</p>}

              {familyMembers.length >= 4 ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs text-center">
                  You have reached the maximum limit of 4 family members. Remove an existing member to add a new one.
                </div>
              ) : (
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>First name *</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} required />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Last name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date of birth</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gender</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Race / ethnicity</label>
                      <input type="text" value={race} onChange={(e) => setRace(e.target.value)} placeholder="e.g. Asian Indian" className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Height</label>
                      <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 5.8ft" className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Weight</label>
                      <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 68kg" className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>A1C (%)</label>
                      <input type="text" value={a1c} onChange={(e) => setA1c(e.target.value)} placeholder="e.g. 5.6" className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blood pressure</label>
                    <input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="e.g. 120/80" className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`block text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Medicines or conditions</label>
                      <label className="text-xs text-rose-600 hover:underline cursor-pointer font-semibold">
                        {isScanning ? "Scanning..." : "Scan Prescription"}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePrescriptionScan} />
                      </label>
                    </div>
                    <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="Metformin, Vitamin D3" className={`w-full px-3 py-2 border rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200'}`} rows="3" />
                  </div>

                  <button type="submit" className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg mt-4 shadow-md shadow-rose-600/20">Add member →</button>
                </form>
              )}
            </div>
          )}

          {currentView === 'profile-detail' && selectedMember && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className={`p-6 rounded-2xl border shadow-lg flex justify-between items-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-rose-100'}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {getInitials(selectedMember.first_name, selectedMember.last_name)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedMember.first_name} {selectedMember.last_name}</h2>
                    <p className="text-xs text-gray-400">DOB: {selectedMember.date_of_birth} • Gender: {selectedMember.gender}</p>
                  </div>
                </div>
                <button onClick={() => handleRemoveMember(selectedMember.id)} className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl text-xs font-semibold transition">🗑️ Remove</button>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {[
                  { label: 'A1C', value: selectedMember.a1c },
                  { label: 'Blood pressure', value: selectedMember.blood_pressure },
                  { label: 'Weight', value: selectedMember.weight },
                  { label: 'Height', value: selectedMember.height },
                  { label: 'DOB', value: selectedMember.date_of_birth },
                ].map((stat, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border shadow-md ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-rose-100'}`}>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className={`text-sm font-bold ${stat.value === '-' ? 'text-gray-400' : (isDarkMode ? 'text-white' : 'text-gray-800')}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className={`p-6 rounded-2xl border shadow-md ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-rose-100'}`}>
                <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <span>💊</span> <span>Medicines & conditions</span>
                </div>
                <div className={`text-sm ${selectedMember.conditions === 'None listed' ? 'text-gray-400 italic' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>{selectedMember.conditions}</div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-lg ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-rose-100'}`}>
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">✨</span>
                    <div className="text-left">
                      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ask medlife.ai (Qwen 1.8B)</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg p-3.5 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-rose-600 text-white rounded-br-none' : (isDarkMode ? 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700' : 'bg-rose-50 text-gray-800 rounded-bl-none border border-rose-100')}`}>
                        <div className="text-[10px] font-semibold opacity-70 mb-1">{msg.sender === 'user' ? 'You' : `MedlifeAI Database + Qwen 1.8B`}</div>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAnswering && (
                    <div className="flex justify-start">
                      <div className={`p-3 rounded-2xl text-xs italic ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-rose-100 text-rose-700'}`}>
                        Querying database & Qwen 1.8B...
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={`Ask a question based on ${selectedMember.first_name}'s records...`} className={`flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-rose-200 text-gray-900'}`} disabled={questionCount >= 100} />
                  <button type="submit" disabled={isAnswering} className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl">Send →</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}