import React from 'react';
import Auth from '../components/auth/Auth';

const Register = ({ role }) => {
    return <Auth role={role} initialMode="signup" />;
};

export default Register;