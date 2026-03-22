import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';

const Login = () => {
  const [role, setRole] = useState('Freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authService.login(email, password, role);
      navigate('/');
    } catch (err) {

      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background Shapes */}
      <div className="absolute top-10 left-10 w-24 h-24 text-blue-100 opacity-50">
        <Briefcase size={96} />
      </div>
      <div className="absolute bottom-10 right-10 w-24 h-24 text-blue-100 opacity-50">
        <Briefcase size={96} />
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-lg relative overflow-hidden">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
            <Briefcase className="text-white w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">Welcome to TalentLink</h1>
        <p className="text-center text-gray-500 mb-8">Connect, collaborate, and grow your career</p>

        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 text-center mb-4">I am a...</p>
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setRole('Freelancer')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                role === 'Freelancer' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Freelancer
            </button>
            <button
              onClick={() => setRole('Client')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                role === 'Client' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Client
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Forgot password?
            </Link>

          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
          >
            Sign In as {role}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
