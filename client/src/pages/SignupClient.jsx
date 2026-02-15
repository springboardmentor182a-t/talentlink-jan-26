import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';
import SignupClientForm from '../features/components/SignupClientForm';
import '../assets/auth.css';

const SignupClient = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/signup" className="back-nav">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="role-icon-header">
          <Briefcase size={28} />
        </div>

        <div className="auth-header">
          <h1>Join as a Client</h1>
          <p>Hire skilled professionals for your next project.</p>
        </div>

        <SignupClientForm />
      </div>
    </div>
  );
};

export default SignupClient;
