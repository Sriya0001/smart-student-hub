import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Card = ({ icon, title, desc, linkText, onClick, color }) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-start gap-4 hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
      <button 
        onClick={onClick}
        className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline cursor-pointer"
      >
        {linkText} →
      </button>
    </div>
  </div>
);

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [profileRes, activitiesRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/students/profile', { headers }),
        axios.get('http://localhost:3000/api/students/my', { headers }),
        axios.get('http://localhost:3000/api/students/stats', { headers })
      ]);
      
      setUser(profileRes.data);
      setActivities(activitiesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = () => {
    if (!user) return;
    const doc = new jsPDF();
    let yPos = 20;

    // --- Header Section ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(33, 37, 41);
    doc.text(user.name.toUpperCase(), 20, yPos);
    yPos += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`${user.email}  |  ${user.phone || 'Contact Info Not Provided'}`, 20, yPos);
    yPos += 6;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    // --- Education ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('EDUCATION', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text(user.college || 'Degree Candidate', 20, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(user.department || 'Not Specified', 20, yPos);
    yPos += 15;

    // --- Key Projects & Internships ---
    const projects = activities.filter(a => a.status === 'approved' && (a.category === 'Project' || a.category === 'Internship'));
    if (projects.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('TECHNICAL PROJECTS & INTERNSHIPS', 20, yPos);
        yPos += 8;

        projects.forEach(proj => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(33, 37, 41);
            doc.text(proj.title, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(new Date(proj.date).toLocaleDateString(), 190, yPos, { align: 'right' });
            yPos += 5;
            doc.setTextColor(71, 85, 105);
            const splitDesc = doc.splitTextToSize(proj.description || 'Verified project achievement.', 160);
            doc.text(splitDesc, 25, yPos);
            yPos += (splitDesc.length * 5) + 5;
        });
        yPos += 5;
    }

    // --- Academic Certifications ---
    const certs = activities.filter(a => a.status === 'approved' && (a.category === 'Academic' || a.category === 'Workshop' || a.category === 'Co-Curricular'));
    if (certs.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('CERTIFICATIONS & ACADEMIC ACHIEVEMENTS', 20, yPos);
        yPos += 8;

        certs.forEach(cert => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(33, 37, 41);
            doc.text(`• ${cert.title} (${cert.category})`, 25, yPos);
            doc.setFontSize(9);
            doc.text(new Date(cert.date).toLocaleDateString(), 190, yPos, { align: 'right' });
            yPos += 6;
        });
        yPos += 10;
    }

    // --- Others ---
    const others = activities.filter(a => a.status === 'approved' && (a.category === 'Extra-Curricular' || a.category === 'Sports' || a.category === 'Cultural' || a.category === 'Other'));
    if (others.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('EXTRACURRICULAR & LEADERSHIP', 20, yPos);
        yPos += 8;

        others.forEach(oth => {
            if (yPos > 270) { doc.addPage(); yPos = 20; }
            doc.setFontSize(11);
            doc.text(`• ${oth.title}`, 25, yPos);
            yPos += 6;
        });
    }

    // --- Footer Seal ---
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    const footerText = `OFFICIAL VERIFIED RECORD  |  SMART STUDENT HUB ID: ${user._id}  |  DATE: ${new Date().toLocaleDateString()}`;
    doc.text(footerText, 105, 285, { align: 'center' });

    doc.save(`${user.name.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  const shareToLinkedIn = (activity) => {
    const text = `I'm proud to share my verified achievement: "${activity.title}" in ${activity.category}. Verified by Smart Student Hub. #Achievement #Growth`;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-10 pb-12">
      {/* Premium Header Bar */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 border-white">
            {user?.name?.[0].toUpperCase() || 'S'}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, {user?.name.split(' ')[0].toLowerCase()}!</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs font-bold font-mono">ID: {user?._id.slice(-8).toUpperCase()}</span>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Active Student
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/student/profile')}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
          >
            ⚙️ Edit Profile
          </button>
          <button 
            onClick={() => navigate('/student/profile')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
          >
            👁️ View Profile
          </button>
        </div>
      </div>

      {/* Modern Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card 
          icon="📖" 
          title="Academic Records" 
          desc="View your academic performance and track your growth progress across semesters."
          linkText="Explore"
          color="bg-blue-600"
          onClick={() => navigate('/student/records')}
        />
        <Card 
          icon="✅" 
          title="Academic Certificates" 
          desc="Manage and showcase your academic achievements and certificates in one place."
          linkText="Manage"
          color="bg-emerald-600"
          onClick={() => navigate('/student/upload')}
        />
        <Card 
          icon="🏆" 
          title="Personal Achievements" 
          desc="Track your personal certificates and accomplishments outside of academics."
          linkText="View"
          color="bg-orange-500"
          onClick={() => navigate('/student/achievements')}
        />
        <Card 
          icon="👤" 
          title="Profile Management" 
          desc="Update your personal details, documentation, and contact information safely."
          linkText="Edit"
          color="bg-pink-600"
          onClick={() => navigate('/student/profile')}
        />
        <Card 
          icon="💼" 
          title="Project Portfolio" 
          desc="Showcase your technical projects, research work, and live deployments."
          linkText="Add"
          color="bg-indigo-600"
          onClick={() => navigate('/student/portfolio')}
        />
        <Card 
          icon="📥" 
          title="Generate Resume" 
          desc="Create a professional PDF portfolio or resume directly from your verified data."
          linkText="Download"
          color="bg-rose-500"
          onClick={handleGenerateResume}
        />
        {user?.mentor && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between hover:scale-105 transition-all">
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl">👩‍🏫</span>
              </div>
              <h3 className="text-xl font-bold mb-1">My Mentor</h3>
              <p className="text-indigo-100 text-[10px] font-medium mb-4 uppercase tracking-widest">Guide for {user.department}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="opacity-70">Name:</span> <span>{user.mentor.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="opacity-70">Email:</span> <span>{user.mentor.email}</span>
                </div>
              </div>
            </div>
            <button className="mt-6 bg-white text-indigo-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
              Contact Mentor
            </button>
          </div>
        )}
      </div>

      {/* Activity Status Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mt-12 transition-all">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase tracking-widest text-[10px] text-gray-400">Activity Integrity Stream</h3>
          <div className="flex gap-4">
               <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> {stats.approved} Approved</span>
               <span className="flex items-center gap-2 text-xs font-bold text-gray-500"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> {stats.pending} Pending</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-gray-50 uppercase text-[10px] font-black text-gray-400">
              <tr>
                <th className="px-8 py-5">Activity Details</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Security Hash</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activities.map((act) => (
                <tr key={act._id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{act.title}</span>
                      <span className="text-xs text-gray-400">{new Date(act.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{act.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono text-[10px] text-gray-300 truncate w-24 block" title={act.hash}>
                      {act.hash ? `${act.hash.slice(0, 12)}...` : 'N/A (Pending)'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {act.status === 'approved' && (
                        <button 
                          onClick={() => shareToLinkedIn(act)}
                          className="p-2 bg-[#0077b5] text-white rounded-lg hover:scale-110 transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-sm"
                          title="Share to LinkedIn"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </button>
                      )}
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        act.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        act.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activities.length === 0 && (
            <div className="p-20 text-center text-gray-300 italic font-medium">Your achievement timeline is empty. Start by uploading a certificate.</div>
          )}
        </div>
      </div>
    </div>
  );
}
