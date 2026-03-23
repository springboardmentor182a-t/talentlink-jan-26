import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="790717010610-i7p0u6mdasp062rg3v01cvc6bctls6rq.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
