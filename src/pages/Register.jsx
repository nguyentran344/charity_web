import React from 'react';
import AuthForm from '../components/AuthForm';

const Register = ({ email, setEmail, password, setPassword, handleRegister, error }) => {
  return (
    <AuthForm
      mode="register"
      onSubmit={handleRegister}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
    />
  );
};

export default Register;