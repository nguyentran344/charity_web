import React from 'react';
import AuthForm from '../components/AuthForm';

const Login = ({ email, setEmail, password, setPassword, handleLogin, error }) => {
  return (
    <AuthForm
      mode="login"
      onSubmit={handleLogin}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
    />
  );
};

export default Login;