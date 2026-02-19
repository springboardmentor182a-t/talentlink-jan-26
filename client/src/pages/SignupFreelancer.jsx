import React from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';
import SignupFreelancerForm from '../features/components/SignupFreelancerForm';
import '../assets/auth.css';

const SignupFreelancer = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/signup" className="back-nav">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="role-icon-header">
          <User size={28} />
        </div>

        <div className="auth-header">
          <h1>Join as a Freelancer</h1>
          <p>Create your profile and start bidding on jobs.</p>
        </div>

        <SignupFreelancerForm />
      </div>
    </div>
  );
};

export default SignupFreelancer;
