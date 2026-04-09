import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CertificateUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a certificate file');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('date', formData.date);
      data.append('certificate', file);

      await axios.post('http://localhost:3000/api/students/upload', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Activity uploaded successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Upload Activity</h1>
          <p className="text-gray-500 font-medium">Add a new achievement to your professional portfolio.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Activity Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Web Development Workshop"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Category</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Academic</option>
                  <option>Co-Curricular</option>
                  <option>Extra-Curricular</option>
                  <option>Workshop</option>
                  <option>Internship</option>
                  <option>Project</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Completion Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Certificate Proof (PDF/JPG)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <div className="w-full bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center group-hover:bg-blue-50 transition-all">
                  <span className="text-3xl mb-2 block">📁</span>
                  <span className="text-sm font-bold text-blue-600">
                    {file ? file.name : 'Click to select or drag and drop'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 uppercase font-black tracking-widest">PDF, JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Description</label>
              <textarea 
                rows="4"
                placeholder="Briefly describe what you learned or achieved..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium transition-all"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Processing Upload...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
