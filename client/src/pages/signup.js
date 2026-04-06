import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Briefcase, Building2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';

const SignUp = () => {
    const [role, setRole] = useState('Freelancer');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        try {
            await authService.signup({
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password,
                role: role
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Sign up failed. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            {/* Simple Background Decor */}
            <div className="absolute top-10 left-10 w-24 h-24 text-blue-100 opacity-50">
                <User size={96} />
            </div>
            <div className="absolute bottom-10 right-10 w-24 h-24 text-blue-100 opacity-50">
                <User size={96} />
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-2xl relative overflow-hidden">
                {/* Header Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
                        <User className="text-white w-8 h-8" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">Create Your Account</h1>
                <p className="text-center text-gray-500 mb-8">Join thousands of professionals on TalentLink</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => setRole('Freelancer')}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 relative ${
                            role === 'Freelancer' ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200'
                        }`}
                    >
                        {role === 'Freelancer' && (
                            <CheckCircle className="absolute top-3 right-3 text-blue-600 w-5 h-5 fill-white" />
                        )}
                        <Briefcase className={`${role === 'Freelancer' ? 'text-blue-600' : 'text-gray-400'} w-10 h-10`} />
                        <div className="text-center">
                            <p className="font-bold text-blue-900">Freelancer</p>
                            <p className="text-xs text-gray-400">Find projects & grow</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setRole('Client')}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 relative ${
                            role === 'Client' ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200'
                        }`}
                    >
                        {role === 'Client' && (
                            <CheckCircle className="absolute top-3 right-3 text-blue-600 w-5 h-5 fill-white" />
                        )}
                        <Building2 className={`${role === 'Client' ? 'text-blue-600' : 'text-gray-400'} w-10 h-10`} />
                        <div className="text-center">
                            <p className="font-bold text-blue-900">Client</p>
                            <p className="text-xs text-gray-400">Hire top talent</p>
                        </div>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                placeholder="John"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                placeholder="Doe"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail size={20} />
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@yourcompany.com"
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    value={formData.password}
                                    onChange={handleChange}
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
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={20} />
                                </span>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                        <span className="text-sm text-gray-600">
                            I agree to the <button type="button" className="text-blue-600 font-semibold underline">Terms of Service</button> and <button type="button" className="text-blue-600 font-semibold underline">Privacy Policy</button>
                        </span>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                        Create Account
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
