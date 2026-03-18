import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FreelancerProfile = () => {
  // 1. Create state to hold the skills from the database
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Define the API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  // 3. Fetch skills when the component loads
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/skills`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // This handles both formats: an array of strings ['React'] or objects [{name: 'React'}]
        const fetchedSkills = response.data.map(skill => 
          typeof skill === 'string' ? skill : skill.name
        );
        
        setSkills(fetchedSkills);
      } catch (error) {
        console.error("Failed to fetch skills from database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px' }}>My Profile</h1>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Left Column: Avatar and Stats */}
        <div style={{ width: '300px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', border: '1px solid #E9ECEF', marginBottom: '30px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#FF7A1A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', margin: '0 auto 20px' }}>
              JD
            </div>
            <h3 style={{ margin: '0 0 5px 0' }}>John Doe</h3>
            <p style={{ color: '#6C757D', fontSize: '14px', marginBottom: '15px' }}>Full Stack Developer</p>
            <div style={{ color: '#FF7A1A', marginBottom: '20px' }}>⭐ 4.9 <span style={{ color: '#6C757D' }}>(47 reviews)</span></div>
            <button style={{ width: '100%', padding: '10px', backgroundColor: '#FF7A1A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Contact Me</button>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <h4 style={{ marginBottom: '15px' }}>Statistics</h4>
            {[
              { label: 'Projects Done', val: '24' },
              { label: 'Success Rate', val: '98%' },
              { label: 'Total Earned', val: '$48,500' },
              { label: 'Member Since', val: 'Jan 2023' }
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ color: '#6C757D' }}>{stat.label}</span>
                <span style={{ fontWeight: 'bold' }}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: About, Skills, Experience */}
        <div style={{ flex: 1 }}>
          {/* About Me */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>About Me</h3>
              <button style={{ color: '#FF7A1A', background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
            </div>
            <p style={{ color: '#444', lineHeight: '1.6', marginTop: '15px' }}>
              I'm a passionate full stack developer with over 5 years of experience building modern web applications.
              I specialize in React, Node.js, and cloud technologies.
            </p>
          </section>

          {/* Skills (Now dynamically mapping from database!) */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span key={index} style={{ padding: '6px 15px', backgroundColor: '#FFF5EE', color: '#FF7A1A', borderRadius: '20px', fontSize: '14px' }}>
                    {skill}
                  </span>
                ))
              ) : (
                <p style={{ color: '#6C757D', fontSize: '14px' }}>No skills found in database.</p>
              )}
            </div>
          </section>

          {/* Work Experience */}
          <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Work Experience</h3>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 5px 0' }}>Senior Full Stack Developer</h4>
              <p style={{ margin: 0, color: '#FF7A1A', fontSize: '14px' }}>TechCorp Solutions • 2021 - Present</p>
              <p style={{ color: '#6C757D', fontSize: '14px', marginTop: '10px' }}>Leading development of enterprise web applications using React and Node.js.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;