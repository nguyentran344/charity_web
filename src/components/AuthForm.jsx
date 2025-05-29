import React from 'react';
import './AuthForm.css';

const AuthForm = ({ mode, onSubmit, email, setEmail, password, setPassword, error }) => {
  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">{mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}</h2>
      {error && <p className="auth-form-error">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="auth-form-input"
      />
      <input
        type="password"
        placeholder="Mật Khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="auth-form-input"
      />
      <button
        onClick={onSubmit}
        className="auth-form-button"
      >
        {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
      </button>
    </div>
  );
};

export default AuthForm;
