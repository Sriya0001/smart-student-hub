import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export default function FacultyDashboard() {
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0, categoryStats: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'history', 'mentees'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [activitiesRes, historyRes, statsRes, menteesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/teachers/activities/pending`, { headers }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/teachers/activities/history`, { headers }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/teachers/stats`, { headers }),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/teachers/mentees`, { headers })
      ]);
      
      setActivities(activitiesRes.data);
      setHistory(historyRes.data);
      setStats(statsRes.data);
      setMentees(menteesRes.data);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error fetching faculty data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReview = async (status) => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to ${status} ${selectedIds.length} activities?`)) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/teachers/activities/bulk-review`, 
        { ids: selectedIds, status, remarks: `Bulk ${status} by faculty review queue.` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (err) {
      console.error('Bulk review error:', err);
      alert('Failed to process bulk review.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = async (id) => {
    if (!window.confirm('Are you sure you want to undo this review and move it back to the pending queue?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/teachers/activities/${id}/undo`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Undo error:', err);
      alert('Failed to undo review.');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredActivities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredActivities.map(a => a._id));
    }
  };

  const filteredActivities = (activeTab === 'queue' ? activities : history).filter(a => 
    a.studentId?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    a.title?.toLowerCase().includes(filter.toLowerCase()) ||
    a.studentId?.studentId?.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredMentees = mentees.filter(m => 
    m.name?.toLowerCase().includes(filter.toLowerCase()) ||
    m.studentId?.toLowerCase().includes(filter.toLowerCase())
  );

  const barData = [
    { name: 'Pending', count: stats.pendingCount },
    { name: 'Approved', count: stats.approvedCount },
    { name: 'Rejected', count: stats.rejectedCount }
  ];

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8 pb-32">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-50/50 rounded-full blur-[80px]"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Faculty Dashboard</h2>
          <p className="text-gray-500 font-medium mt-2 max-w-xl font-mono text-[10px] uppercase tracking-widest px-1">
             ANALYTICS & VERIFICATION SUBSYSTEM v3.0
          </p>
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 text-center min-w-[100px]">
            <span className="text-2xl font-black text-amber-600 block">{stats.pendingCount}</span>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Pending</span>
          </div>
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 text-center min-w-[100px]">
            <span className="text-2xl font-black text-emerald-600 block">{stats.approvedCount}</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Approved</span>
          </div>
          <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 text-center min-w-[100px]">
            <span className="text-2xl font-black text-indigo-600 block">{mentees.length}</span>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Load</span>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
             <span className="text-blue-600">📊</span> Activity Distribution
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-2 gap-2 mt-4 px-4 overflow-y-auto max-h-24">
              {stats.categoryStats.map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                   <span className="text-[10px] font-bold text-gray-600">{cat.name} ({cat.value})</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
             <span className="text-indigo-600">📈</span> Review Progress
           </h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
           </div>
           <p className="text-center text-gray-400 text-xs font-medium mt-4 italic">Updated in real-time from database</p>
        </div>
      </div>

      {/* Main Review Section with Tabs */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 w-fit">
              <button 
                onClick={() => setActiveTab('queue')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'queue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600 cursor-pointer'}`}
              >
                PENDING QUEUE
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-400 hover:text-gray-600 cursor-pointer'}`}
              >
                RECENT HISTORY
              </button>
              <button 
                onClick={() => setActiveTab('mentees')}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'mentees' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-400 hover:text-gray-600 cursor-pointer'}`}
              >
                MY MENTEES
              </button>
            </div>
            
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder={`Search in ${activeTab === 'queue' ? 'queue' : activeTab === 'history' ? 'history' : 'mentees'}...`}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-700 shadow-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg grayscale opacity-50">🔍</span>
            </div>
          </div>

          {activeTab === 'queue' && filteredActivities.length > 0 && (
            <div className="flex items-center gap-4 mt-6 px-2">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={selectedIds.length === filteredActivities.length && filteredActivities.length > 0}
                onChange={toggleSelectAll}
              />
              <h3 className="text-sm font-black text-gray-500 tracking-tight uppercase">Select All for Bulk Action</h3>
            </div>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {activeTab === 'mentees' ? (
            filteredMentees.map((mentee) => (
              <div key={mentee._id} className="p-8 hover:bg-emerald-50/30 transition-all flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg border-2 border-white">
                    {mentee.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 leading-tight">{mentee.name}</h4>
                    <p className="text-gray-500 font-bold text-xs mt-1">
                      {mentee.department} • <span className="text-emerald-600 font-mono">{mentee.studentId || 'STUDENT'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col text-right gap-1">
                   <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Email</span>
                      <span className="text-xs font-bold text-gray-700">{mentee.email}</span>
                   </div>
                   <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Phone</span>
                      <span className="text-xs font-bold text-gray-700">{mentee.phone || 'N/A'}</span>
                   </div>
                </div>
              </div>
            ))
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity._id} className={`p-8 transition-all flex items-center gap-6 ${activeTab === 'queue' && selectedIds.includes(activity._id) ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                {activeTab === 'queue' && (
                  <div className="flex-shrink-0">
                    <input 
                      type="checkbox" 
                      className="w-6 h-6 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIds.includes(activity._id)}
                      onChange={() => toggleSelect(activity._id)}
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className={`w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg border-2 border-white ${activeTab === 'queue' ? 'from-blue-500 to-indigo-600' : 'from-gray-400 to-gray-500'}`}>
                      {activity.category === 'Academic' ? '🎓' : activity.category === 'Project' ? '💻' : '🏆'}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 leading-tight">{activity.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-500 font-bold text-xs">
                          {activity.studentId?.name} • <span className="text-blue-600 font-mono">{activity.studentId?.studentId || 'GLOBAL'}</span>
                        </p>
                        {activity.integrity && (
                          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                            activity.integrity.valid 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                          }`}>
                            {activity.integrity.valid ? '✓ VERIFIED' : '⚠ ' + activity.integrity.message}
                          </div>
                        )}
                        {activeTab === 'history' && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${activity.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                            {activity.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activity.category}</span>
                      <span className="text-sm font-bold text-gray-700">{new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <a 
                        href={`${import.meta.env.VITE_API_BASE_URL_BASE}${activity.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-gray-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm group"
                        title="View Certificate"
                      >
                        <span className="text-lg">📄</span>
                      </a>
                      {activeTab === 'history' && (
                        <button 
                          onClick={() => handleUndo(activity._id)}
                          className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm group"
                          title="Undo Review & Move to Pending"
                        >
                          <span className="text-sm font-black">↺ UNDO</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}

          {(activeTab === 'mentees' ? filteredMentees : filteredActivities).length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-4">
              <div className="text-6xl grayscale opacity-30">{activeTab === 'queue' ? '🎯' : activeTab === 'history' ? '⌛' : '👥'}</div>
              <h4 className="text-2xl font-black text-gray-300">
                {activeTab === 'queue' ? 'Queue is empty' : activeTab === 'history' ? 'No history found' : 'No mentees assigned'}
              </h4>
              <p className="text-gray-400 font-medium max-w-xs mx-auto">
                {activeTab === 'queue' 
                  ? 'No pending certificates match your current filter.' 
                  : activeTab === 'history' 
                  ? 'You havent reviewed any activities yet.'
                  : 'You are not assigned as a mentor to any students in your department yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar (only show in queue) */}
      {activeTab === 'queue' && selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-blue-100 px-8 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-12 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex flex-col">
             <span className="text-blue-600 font-black text-2xl leading-none">{selectedIds.length}</span>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Items Selected</span>
          </div>
          <div className="h-10 w-px bg-gray-100"></div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleBulkReview('rejected')}
              disabled={isProcessing}
              className="bg-rose-50 text-rose-600 px-8 py-3 rounded-2xl font-black text-sm hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              REJECT SELECTED
            </button>
            <button 
              onClick={() => handleBulkReview('approved')}
              disabled={isProcessing}
              className="bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              {isProcessing ? 'PROCESSING...' : 'APPROVE ALL SELECTED'}
            </button>
          </div>
          <button 
             onClick={() => setSelectedIds([])}
             className="text-gray-400 font-bold hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
