import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const requestOtp = async (endpoint) => {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          ...(endpoint === 'verify-otp' ? { otp: otp.trim() } : {})
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Unable to verify email');
      }
      if (endpoint === 'verify-otp') {
        login(data);
        navigate('/');
        return;
      }
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={(event) => { event.preventDefault(); requestOtp('verify-otp'); }} className="auth-form">
        <h2>Verify Your Email</h2>
        <p className="auth-help">Enter the 6-digit OTP sent to your email address.</p>
        <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" placeholder="6-digit OTP" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} required />
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Verifying...' : 'Verify Email'}</button>
        <button type="button" className="auth-secondary-button" onClick={() => requestOtp('resend-otp')} disabled={busy || !email}>Resend OTP</button>
        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
        <p><Link to="/login">Back to Login</Link></p>
      </form>
    </div>
  );
};

export default VerifyEmail;
