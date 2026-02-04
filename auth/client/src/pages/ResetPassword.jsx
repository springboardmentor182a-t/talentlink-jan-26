import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import '../styles/auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/login" className="back-nav">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="role-icon-header">
          <Lock size={28} />
        </div>

        <div className="auth-header">
          <h1>Set new password</h1>
          <p>Enter your new password below to secure your account.</p>
        </div>

        <form className="auth-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="••••••••" 
                required 
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-primary btn-full">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;