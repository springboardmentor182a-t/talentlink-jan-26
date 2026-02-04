import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import SignupClientForm from '../components/auth/SignupClientForm';
import '../styles/auth.css';

const SignupClient = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Design Nav */}
        <Link to="/login" className="back-nav">
          <ArrowLeft size={16} /> Back to login
        </Link>

        {/* Orange Square Icon Header */}
        <div className="role-icon-header">
          <Briefcase size={28} />
        </div>

        <div className="auth-header">
          <h1>Join as a Client</h1>
          <p>Hire skilled professionals for your next project.</p>
        </div>

        {/* The clean form component */}
        <SignupClientForm />
      </div>
    </div>
  );
};

export default SignupClient;