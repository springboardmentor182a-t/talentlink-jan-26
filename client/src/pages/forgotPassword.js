import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../services/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        setResetToken('');
        try {
            const res = await authService.forgotPassword(email);
            setMessage(res.message);
            if (res.token_hint) {
                setResetToken(res.token_hint);
            }
        } catch (err) {

            setError(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
                <Link to="/login" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-semibold">Back to Login</span>
                </Link>

                <h1 className="text-3xl font-bold text-blue-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail size={20} />
                            </span>
                            <input
                                type="email"
                                placeholder="name@yourcompany.com"
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="text-sm text-green-600 bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col gap-3">
                            <p>{message}</p>
                            {resetToken && (
                                <Link 
                                    to={`/reset-password?token=${resetToken}`}
                                    className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 underline"
                                >
                                    Click here to reset your password
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>
                    )}
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
