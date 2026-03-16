import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Briefcase } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="top-bar">
            <div className="brand">
                <div className="brand-logo">
                    <Briefcase size={22} color="white" fill="white" strokeWidth={1.5} />
                </div>
                <span className="brand-name">
                    <span className="text-talent">Talent</span>
                    <span className="text-link">Link</span>
                </span>
            </div>

            <div className="top-right-section">
                <div className="user-profile">
                    <div className="user-info">
                        <div className="user-name">{user?.name || 'Alex Morgan'}</div>
                        <div className="user-role">{user?.role || 'Freelancer'}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Navbar;
