import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    college: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/students/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: res.data.name || '',
        phone: res.data.phone || '',
        department: res.data.department || '',
        college: res.data.college || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/api/students/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-6 mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white">
          {formData.name[0]?.toUpperCase() || 'S'}
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
          <p className="text-gray-500 font-medium">Manage your personal information and contact details</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                placeholder="+91 9999999999"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Department</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Computer Science"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">College/Institution</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Global University"
                value={formData.college}
                onChange={e => setFormData({...formData, college: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-50 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/student/dashboard')}
              className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'SAVING CHANGES...' : 'SAVE PROFILE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
