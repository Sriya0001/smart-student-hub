import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('waking'); // 'waking' | 'ready' | 'error'
  const navigate = useNavigate();

  // Ping backend immediately on page load so Render's cold start
  // happens in the background while the user types credentials
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/test`, { timeout: 60000 });
        setServerStatus('ready');
      } catch {
        // Server may still respond to login even if /test fails
        setServerStatus('error');
      }
    };
    wakeUpServer();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const userRole = response.data.user.role;
      if (userRole === 'faculty' || userRole === 'teacher') navigate('/faculty/dashboard');
      else if (userRole === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Server unreachable. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <span className="text-white text-3xl font-extrabold tracking-tighter">SH</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">Smart Student Hub</h2>

          {/* Server status badge */}
          <div className="flex items-center gap-1.5 text-xs mt-1">
            {serverStatus === 'waking' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                <span className="text-gray-500">Connecting to server...</span>
              </>
            )}
            {serverStatus === 'ready' && (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                <span className="text-green-600 font-medium">Server ready</span>
              </>
            )}
            {serverStatus === 'error' && (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
                <span className="text-red-500">Server may be slow to respond</span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-70 flex justify-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div> : 'Sign In to Portal'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
