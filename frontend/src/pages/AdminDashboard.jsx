import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{monthNames[label] || label}</p>
        <p className="text-lg font-black text-blue-600">{payload[0].value} Activities</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, logsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/analytics', { headers }),
        axios.get('http://localhost:3000/api/admin/logs', { headers }),
        axios.get('http://localhost:3000/api/admin/users', { headers })
      ]);
      
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRepairMentorships = async () => {
    if (!window.confirm('This will scan all students and automatically assign missing mentors based on department load. Proceed?')) return;
    
    setIsRepairing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/admin/mentorships/repair', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      console.error('Repair failed:', err);
      alert('Failed to execute repair script.');
    } finally {
      setIsRepairing(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Refresh & Repair */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Performance</h2>
          <p className="text-gray-500 font-medium font-mono text-[10px] uppercase tracking-tighter">DATA ANALYTICS & INTEGRITY MONITORING</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleRepairMentorships}
            disabled={isRepairing}
            className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Fix missing student-mentor links"
          >
            {isRepairing ? 'REPAIRING...' : '🔧 REPAIR SYSTEM'}
          </button>
          <button 
            onClick={fetchData}
            disabled={isRefreshing}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRefreshing ? 'REFRESHING...' : 'REFRESH LIVE DATA'}
          </button>
        </div>
      </div>

      {/* Top Stats - same as before */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:border-blue-200 transition-all duration-300">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Student Base</span>
          <span className="text-5xl font-black text-gray-900">{stats?.totalStudents || 0}</span>
          <div className="w-12 h-1.5 bg-blue-500 rounded-full mt-4"></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:border-indigo-200 transition-all duration-300">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Accounts</span>
          <span className="text-5xl font-black text-gray-900">{users.length}</span>
          <div className="w-12 h-1.5 bg-indigo-500 rounded-full mt-4"></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:border-cyan-200 transition-all duration-300">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Achievements</span>
          <span className="text-5xl font-black text-gray-900">{stats?.totalActivities || 0}</span>
          <div className="w-12 h-1.5 bg-cyan-500 rounded-full mt-4"></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center hover:border-emerald-200 transition-all duration-300">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Success Rate</span>
          <span className="text-5xl font-black text-gray-900">{stats?.approvalRate || 0}%</span>
          <div className="w-12 h-1.5 bg-emerald-500 rounded-full mt-4"></div>
        </div>
      </div>

      {/* Charts Row - same as before */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
            <h3 className="text-xl font-black text-gray-800">Monthly Participation</h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Trend 📈</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyParticipation || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }}
                  tickFormatter={(val) => monthNames[val] || val}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
            <h3 className="text-xl font-black text-gray-800">Category Distribution</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Share 📊</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="_id"
                  stroke="none"
                >
                  {(stats?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Enhanced User Management Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-gray-50/50 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
             Active Accounts Base <span className="px-3 py-1 bg-white text-blue-600 rounded-xl text-xs font-black shadow-sm">{users.length}</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white uppercase text-[10px] font-black text-gray-400">
              <tr>
                <th className="px-8 py-5 border-b border-gray-50">Full Name</th>
                <th className="px-8 py-5 border-b border-gray-50">Role & Status</th>
                <th className="px-8 py-5 border-b border-gray-50">Department</th>
                <th className="px-8 py-5 border-b border-gray-50">Mentor / Load</th>
                <th className="px-8 py-5 border-b border-gray-50 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-8 py-5 font-black text-gray-800">{user.name}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-gray-500 font-bold">{user.email}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md inline-block w-fit ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'faculty' ? 'bg-blue-100 text-blue-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{user.department || 'GLOBAL INFRA'}</td>
                  <td className="px-8 py-5">
                    {user.role === 'student' ? (
                      <span className={`text-xs font-bold ${user.mentor ? 'text-blue-600' : 'text-gray-300 italic'}`}>
                        {user.mentor ? `👤 Mentor: ${user.mentor.name}` : '❌ No Mentor Assigned'}
                      </span>
                    ) : user.role === 'faculty' ? (
                      <span className="text-xs font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">
                        📈 Load: {users.filter(u => u.mentor?._id === user._id).length} Mentees
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[10px] uppercase font-black tracking-widest">N/A</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-gray-400 font-mono text-xs text-right">
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Trail */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-xl font-black text-gray-800 tracking-tight">System Audit Trail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 uppercase text-[10px] font-black text-gray-400">
              <tr>
                <th className="px-8 py-5">System Actor</th>
                <th className="px-8 py-5">Action Identifier</th>
                <th className="px-8 py-5">Operational Details</th>
                <th className="px-8 py-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-black text-gray-900">{log.userId?.name || 'CORE_SYSTEM'}</span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{log.userId?.role || 'AUTO'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      log.action.includes('login') ? 'bg-white text-blue-700 border-blue-100' :
                      log.action.includes('upload') ? 'bg-white text-amber-700 border-amber-100' :
                      log.action.includes('approve') ? 'bg-white text-emerald-700 border-emerald-100' :
                      log.action.includes('repair') ? 'bg-white text-indigo-700 border-indigo-100' :
                      'bg-white text-gray-700 border-gray-100'
                    }`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-gray-500 font-medium italic text-xs">"{log.description}"</td>
                  <td className="px-8 py-5 text-gray-400 font-mono text-[10px] text-right">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-20 text-center text-gray-300 italic">No system logs available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
