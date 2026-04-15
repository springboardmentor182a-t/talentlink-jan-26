import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFreelancerProfile, getFreelancerProfile } from '../services/api';

const FreelancerProfile = () => {
  const [skills, setSkills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name:         '',
    title:             '',
    bio:               '',
    hourly_rate:       '',
    skillsInput:       '',
    location:          '',
    years_experience:  '',
    availability:      '',
    linkedin:          '',
    github:            '',
    portfolio_website: '',
    twitter:           '',
    phone:             '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { setLoading(false); return; }
    const user = JSON.parse(storedUser);

    getFreelancerProfile(user.id)
      .then(data => {
        setSkills(data.skills || []);
        setForm({
          full_name:         data.full_name         || '',
          title:             data.title             || '',
          bio:               data.bio               || '',
          hourly_rate:       data.hourly_rate        || '',
          skillsInput:       (data.skills || []).join(', '),
          location:          data.location          || '',
          years_experience:  data.years_experience  || '',
          availability:      data.availability      || '',
          linkedin:          data.linkedin          || '',
          github:            data.github            || '',
          portfolio_website: data.portfolio_website || '',
          twitter:           data.twitter           || '',
          phone:             data.phone             || '',
        });
      })
      .catch(() => {
        // No profile yet — form stays empty, user fills it in fresh
      })
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { setErrorMsg('You must be logged in to save your profile.'); return; }
    const user = JSON.parse(storedUser);

    setSaving(true);
    try {
      const payload = {
        full_name:         form.full_name,
        title:             form.title,
        bio:               form.bio,
        hourly_rate:       parseFloat(form.hourly_rate) || 0,
        skills:            form.skillsInput.split(',').map(s => s.trim()).filter(Boolean),
        location:          form.location          || null,
        years_experience:  form.years_experience  || null,
        availability:      form.availability      || null,
        linkedin:          form.linkedin          || null,
        github:            form.github            || null,
        portfolio_website: form.portfolio_website || null,
        twitter:           form.twitter           || null,
        phone:             form.phone             || null,
      };
      await createFreelancerProfile(user.id, payload);
      setSkills(payload.skills);
      setSuccessMsg('Profile saved!');
      setErrorMsg('');
      setTimeout(() => navigate('/profile/freelancer'), 1500);
    } catch (error) {
      console.error(error);
      setErrorMsg('Error saving profile. Please try again.');
      setSuccessMsg('');
    } finally {
      setSaving(false);
    }
  };

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '14px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', color: '#6C757D', marginBottom: '6px' };
  const sectionStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '20px' };

  if (loading) return <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>Loading profile data...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px' }}>My Profile</h1>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Left column */}
        <div style={{ width: '300px' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', border: '1px solid #E9ECEF', marginBottom: '20px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#FF7A1A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', margin: '0 auto 15px' }}>
              {(form.full_name || 'U').slice(0, 2).toUpperCase()}
            </div>
            <h3 style={{ margin: '0 0 5px 0' }}>{form.full_name || 'Your Name'}</h3>
            <p style={{ color: '#6C757D', fontSize: '14px', marginBottom: '15px' }}>{form.title || 'Your Title'}</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #E9ECEF' }}>
            <h4 style={{ marginBottom: '15px' }}>Skills Preview</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skills.map(skill => (
                <span key={skill} style={{ padding: '4px 12px', backgroundColor: '#FFF5EE', color: '#FF7A1A', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — edit form */}
        <div style={{ flex: 1 }}>
          <form onSubmit={onSubmit}>

            {/* Basic Info */}
            <section style={sectionStyle}>
              <h3 style={{ margin: '0 0 20px 0' }}>Basic Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.full_name} onChange={set('full_name')} required style={inputStyle} placeholder="Alex Rivera" />
                </div>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input value={form.title} onChange={set('title')} style={inputStyle} placeholder="Full Stack Developer" />
                </div>
                <div>
                  <label style={labelStyle}>Hourly Rate ($)</label>
                  <input value={form.hourly_rate} onChange={set('hourly_rate')} type="number" min="0" style={inputStyle} placeholder="85" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={form.phone} onChange={set('phone')} style={inputStyle} placeholder="+1 555 000 0000" />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input value={form.location} onChange={set('location')} style={inputStyle} placeholder="San Francisco, CA" />
                </div>
                <div>
                  <label style={labelStyle}>Years of Experience</label>
                  <select value={form.years_experience} onChange={set('years_experience')} style={inputStyle}>
                    <option value="">Select…</option>
                    <option>Less than 1 year</option>
                    <option>1-2 years</option>
                    <option>3-5 years</option>
                    <option>5-10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Availability</label>
                  <select value={form.availability} onChange={set('availability')} style={inputStyle}>
                    <option value="">Select…</option>
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Weekends only</option>
                    <option>Not available</option>
                  </select>
                </div>
              </div>
            </section>

            {/* About Me */}
            <section style={sectionStyle}>
              <h3 style={{ margin: '0 0 15px 0' }}>About Me</h3>
              <textarea value={form.bio} onChange={set('bio')} rows={4}
                style={{ ...inputStyle, lineHeight: '1.5', resize: 'vertical' }}
                placeholder="I'm a passionate full stack developer..." />
            </section>

            {/* Skills */}
            <section style={sectionStyle}>
              <h3 style={{ margin: '0 0 8px 0' }}>Skills</h3>
              <p style={{ fontSize: '13px', color: '#6C757D', margin: '0 0 12px 0' }}>Comma-separated list</p>
              <input value={form.skillsInput} onChange={set('skillsInput')} style={inputStyle} placeholder="React, Python, FastAPI, PostgreSQL" />
            </section>

            {/* Social & Portfolio */}
            <section style={sectionStyle}>
              <h3 style={{ margin: '0 0 20px 0' }}>Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>LinkedIn</label>
                  <input value={form.linkedin} onChange={set('linkedin')} style={inputStyle} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label style={labelStyle}>GitHub</label>
                  <input value={form.github} onChange={set('github')} style={inputStyle} placeholder="https://github.com/..." />
                </div>
                <div>
                  <label style={labelStyle}>Portfolio Website</label>
                  <input value={form.portfolio_website} onChange={set('portfolio_website')} style={inputStyle} placeholder="https://yoursite.com" />
                </div>
                <div>
                  <label style={labelStyle}>Twitter / X</label>
                  <input value={form.twitter} onChange={set('twitter')} style={inputStyle} placeholder="https://x.com/..." />
                </div>
              </div>
            </section>

            {successMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', border: '1px solid #bbf7d0' }}>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px', marginBottom: '8px', border: '1px solid #fecaca' }}>
                {errorMsg}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate('/profile/freelancer')}
                style={{ padding: '12px 28px', backgroundColor: 'white', color: '#374151', border: '1px solid #E9ECEF', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{ padding: '12px 28px', backgroundColor: '#FF7A1A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;