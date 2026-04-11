import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const EMPTY_FACULTY = { name: '', email: '', password: '', department: '', college: '', phone: '' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);

  // Create Faculty modal state
  const [showModal, setShowModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState(EMPTY_FACULTY);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, { headers });
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
      await axios.delete(`${API}/admin/users/${userId}`, { headers });
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user.');
    }
  };

  const handleRepairMentorships = async () => {
    if (!window.confirm('This will assign missing mentors to all existing students based on department workload. Proceed?')) return;
    setIsRepairing(true);
    try {
      const res = await axios.post(`${API}/admin/mentorships/repair`, {}, { headers });
      alert(res.data.message);
      fetchUsers();
    } catch (err) {
      alert(`Repair Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setCreating(true);
    setModalError('');
    try {
      await axios.post(`${API}/admin/users/faculty`, facultyForm, { headers });
      setShowModal(false);
      setFacultyForm(EMPTY_FACULTY);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create faculty account.');
    } finally {
      setCreating(false);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Directory</h2>
          <p className="text-gray-500 font-medium">Manage and monitor all platform accounts</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <button
            id="create-faculty-btn"
            onClick={() => { setShowModal(true); setModalError(''); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            ➕ Add Faculty
          </button>
          <button
            onClick={handleRepairMentorships}
            disabled={isRepairing}
            className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
          >
            {isRepairing ? 'REPAIRING...' : '🔧 REPAIR LINKS'}
          </button>
          <div className="relative w-full md:w-72">
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

      {/* User Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-400">
              <tr>
                <th className="px-8 py-6">User Profile</th>
                <th className="px-8 py-6">Department &amp; College</th>
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

      {/* ── Create Faculty Modal ─────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Create Faculty Account</h3>
                <p className="text-blue-100 text-xs mt-1">New account will have role: Faculty</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white text-2xl cursor-pointer transition-colors leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="p-8 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  {modalError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. Jane Smith', span: true, required: true },
                  { label: 'Email Address', key: 'email', type: 'email', placeholder: 'jane@college.edu', span: true, required: true },
                  { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••', required: true },
                  { label: 'Phone', key: 'phone', type: 'text', placeholder: '+91 9876543210' },
                  { label: 'Department', key: 'department', type: 'text', placeholder: 'Computer Science' },
                  { label: 'College', key: 'college', type: 'text', placeholder: 'Global University' },
                ].map(field => (
                  <div key={field.key} className={field.span ? 'col-span-2' : ''}>
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={facultyForm[field.key]}
                      onChange={e => setFacultyForm({ ...facultyForm, [field.key]: e.target.value })}
                      required={!!field.required}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-create-faculty-btn"
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-60 flex justify-center items-center"
                >
                  {creating
                    ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
