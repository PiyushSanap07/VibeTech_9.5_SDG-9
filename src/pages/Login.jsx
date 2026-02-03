import React from 'react';
import Auth from '../components/auth/Auth';

const Login = ({ role }) => {
  return <Auth role={role} initialMode="login" />;
};

export default Login;
