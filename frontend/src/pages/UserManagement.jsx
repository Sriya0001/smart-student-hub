import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this user account?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user.');
    }
  };

  const handleRepairMentorships = async () => {
    if (!window.confirm('This will assign missing mentors to all existing students based on department workload. Proceed?')) return;
    
    setIsRepairing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/admin/mentorships/repair', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      console.error('Repair failed:', err);
      alert(`Repair Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Directory</h2>
          <p className="text-gray-500 font-medium">Manage and monitor all platform accounts</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleRepairMentorships}
            disabled={isRepairing}
            className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
          >
            {isRepairing ? 'REPAIRING...' : '🔧 REPAIR LINKS'}
          </button>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-400">
              <tr>
                <th className="px-8 py-6">User Profile</th>
                <th className="px-8 py-6">Department & College</th>
                <th className="px-8 py-6">Mentor / Load</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'faculty' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.name?.[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{user.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{user.role}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{user.department || 'N/A'}</span>
                      <span className="text-xs text-gray-400">{user.college || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {user.role === 'student' ? (
                      <span className={`text-[11px] font-black uppercase tracking-wider ${user.mentor ? 'text-blue-600' : 'text-amber-500 bg-amber-50 px-3 py-1 rounded-lg italic'}`}>
                        {user.mentor ? `👤 Mentor: ${user.mentor.name}` : '⚠️ No Mentor Assigned'}
                      </span>
                    ) : user.role === 'faculty' ? (
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                        📈 Load: {users.filter(u => u.mentor?._id === user._id).length} Mentees
                      </span>
                    ) : (
                      <span className="text-gray-300 text-[10px] uppercase font-black tracking-widest">N/A</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black shadow-sm hover:bg-red-600 hover:text-white transition-all cursor-pointer uppercase tracking-widest"
                      >
                        Delete
                      </button>
                    )}
                    {user.role === 'admin' && (
                       <span className="text-xs font-black text-purple-200 uppercase tracking-widest">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-400 italic font-medium">
                    No users matching your search criteria were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
