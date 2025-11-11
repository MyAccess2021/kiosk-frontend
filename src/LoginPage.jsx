// Updated LoginPage.jsx with your friend's UI design
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { login } from './services/authService';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email_or_mobile: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard/home');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(formData);
      if (data.message === 'Login successful') {
        localStorage.setItem('accessToken', data.data.access);
        localStorage.setItem('refreshToken', data.data.refresh);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/dashboard/home');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/40 to-indigo-900/50 backdrop-blur-[1px]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-6 px-8">
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-2xl font-bold tracking-wider">KIOSK</span>
          </div>
          
          <h1 className="text-6xl font-bold leading-tight">
            EXPLORE<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MY ACCESS
            </span>
          </h1>
          
          <p className="text-xl text-white/90 font-light">
            Where Your Dream Destinations<br />
            Become Reality.
          </p>
          
          <p className="text-white/70 text-sm max-w-md leading-relaxed">
            Embark on a journey where every corner of the world is within your reach. Manage your kiosks seamlessly with our powerful dashboard.
          </p>
        </div>

        {/* Right Side - Login Form with Glassmorphism */}
        <div className="w-full max-w-md mx-auto">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Form Header */}
            <div className="p-8 pb-6">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                <span className="text-xl font-bold text-white tracking-wider">KIOSK</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2 text-center lg:text-left">Welcome Back</h2>
              <p className="text-white/70 text-sm text-center lg:text-left">Sign in to access your dashboard</p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-start space-x-3 backdrop-blur-sm animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email or Mobile
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-white/50" />
                  </div>
                  <input
                    type="text"
                    name="email_or_mobile"
                    value={formData.email_or_mobile}
                    onChange={handleInputChange}
                    placeholder="Enter your email or mobile"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-white/50" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent backdrop-blur-sm transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-white/50 hover:text-white/80 transition-colors" />
                    ) : (
                      <Eye className="w-5 h-5 text-white/50 hover:text-white/80 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  disabled={loading}
                  className="text-sm text-white/80 hover:text-white font-medium transition-colors disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-white/50 text-sm">or</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                disabled={loading}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center space-x-3 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                <span>Guest Login</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        {/* <p className="text-sm text-white/60">
          © 2025 Kiosk Management System. All rights reserved.
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;