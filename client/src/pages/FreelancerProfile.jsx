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
  const [form, setForm]       = useState({
    full_name:    '',
    title:        '',
    bio:          '',
    hourly_rate:  '',
    skillsInput:  '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { setLoading(false); return; }
    const user = JSON.parse(storedUser);

    getFreelancerProfile(user.id)
      .then(data => {
        setSkills(data.skills || []);
        setForm({
          full_name:   data.full_name   || '',
          title:       data.title       || '',
          bio:         data.bio         || '',
          hourly_rate: data.hourly_rate || '',
          skillsInput: (data.skills || []).join(', '),
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
        full_name:   form.full_name,
        title:       form.title,
        bio:         form.bio,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        skills:      form.skillsInput.split(',').map(s => s.trim()).filter(Boolean),
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
            <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 20px 0' }}>Basic Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6C757D', marginBottom: '6px' }}>Full Name</label>
                  <input value={form.full_name} onChange={set('full_name')} required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="Alex Rivera" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6C757D', marginBottom: '6px' }}>Title</label>
                  <input value={form.title} onChange={set('title')}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="Full Stack Developer" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6C757D', marginBottom: '6px' }}>Hourly Rate ($)</label>
                  <input value={form.hourly_rate} onChange={set('hourly_rate')} type="number" min="0"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '14px', boxSizing: 'border-box' }}
                    placeholder="85" />
                </div>
              </div>
            </section>

            <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>About Me</h3>
              <textarea value={form.bio} onChange={set('bio')} rows={4}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '14px', lineHeight: '1.5', boxSizing: 'border-box', resize: 'vertical' }}
                placeholder="I'm a passionate full stack developer..." />
            </section>

            <section style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', border: '1px solid #E9ECEF', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>Skills</h3>
              <p style={{ fontSize: '13px', color: '#6C757D', margin: '0 0 12px 0' }}>Comma-separated list</p>
              <input value={form.skillsInput} onChange={set('skillsInput')}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E9ECEF', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="React, Python, FastAPI, PostgreSQL" />
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