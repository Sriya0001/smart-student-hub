import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AchievementCard = ({ activity }) => {
  const shareToLinkedIn = () => {
    const text = `I'm proud to share my verified achievement: "${activity.title}" in ${activity.category}. This record is officially verified on the Smart Student Hub. #Achievement #ProfessionalGrowth #SmartStudentHub`;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group p-6 flex flex-col gap-4">
      <div className="relative h-40 bg-gray-100 rounded-3xl overflow-hidden">
        <img 
          src={`http://localhost:3000${activity.fileUrl}`} 
          alt={activity.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80'; }}
        />
        <div className={`absolute top-4 right-4 capitalize px-3 py-1 rounded-xl text-[10px] font-black shadow-sm ${
          activity.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-white/90 text-blue-600'
        }`}>
          {activity.status}
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-black text-gray-900 leading-tight">{activity.title}</h4>
          <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest">{new Date(activity.date).getFullYear()}</span>
        </div>
        <p className="text-sm text-gray-500 font-medium line-clamp-2">{activity.description || 'Verified achievement and documentation.'}</p>
      </div>
      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{activity.category}</span>
          {activity.status === 'approved' && (
            <button 
              onClick={shareToLinkedIn}
              className="bg-[#0077b5] text-white p-1.5 rounded-lg hover:scale-110 transition-all cursor-pointer shadow-sm"
              title="Share to LinkedIn"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </button>
          )}
        </div>
        <a 
          href={`http://localhost:3000${activity.fileUrl}`} 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-600 font-bold text-xs hover:underline uppercase tracking-tighter"
        >
          View Doc ↗
        </a>
      </div>
    </div>
  );
};

export default function AchievementGallery({ title, categories }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/students/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const filtered = res.data.filter(act => categories.includes(act.category));
      setActivities(filtered);
    } catch (error) {
      console.error('Error fetching filtered activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-50/50 rounded-full blur-[80px]"></div>
        <div className="relative z-10">
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2 hover:translate-x-[-1] transition-all cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
          <p className="text-gray-500 font-medium mt-2 max-w-xl">
             Explore your verified achievements, and maintain your professional growth timeline with secure integrity hashing.
          </p>
        </div>
        <div className="relative z-10 px-8 py-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20">
             <span className="text-white font-black text-2xl">{activities.length}</span>
             <span className="text-blue-100 font-black text-[10px] uppercase block tracking-widest mt-1">Verified Entries</span>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map(act => (
            <AchievementCard key={act._id} activity={act} />
          ))}
        </div>
      ) : (
        <div className="bg-white p-24 text-center rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center gap-4">
          <div className="text-6xl grayscale opacity-40">🕳️</div>
          <h3 className="text-2xl font-black text-gray-300">Nothing here yet</h3>
          <p className="text-gray-400 font-medium max-w-sm mx-auto italic">Start by adding a new certificate or project from the dashboard to populate this section.</p>
          <button 
            onClick={() => navigate('/student/upload')}
            className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all cursor-pointer shadow-blue-500/20"
          >
            Upload Activity
          </button>
        </div>
      )}
    </div>
  );
}
