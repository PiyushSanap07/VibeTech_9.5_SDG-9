import React, { useEffect, useState } from "react";
import "./auth-style.css";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Auth = ({ role = "innovator", initialMode = "login" }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { login, register } = useAuth();
    const navigate = useNavigate();

    // UI Logic
    const [isSignIn, setIsSignIn] = useState(initialMode === "login");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSignIn(initialMode === "login");
        }, 200);
        return () => clearTimeout(timer);
    }, [initialMode]);

    const toggle = () => {
        setIsSignIn((prev) => !prev);
        setError("");
    };

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            if (role === 'funder') navigate('/funder/dashboard');
            else navigate('/innovator/dashboard');
        } catch (err) {
            setError("Invalid credentials or error logging in.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await register(email, password, role, { displayName: name });
            if (role === 'funder') navigate('/funder/dashboard');
            else navigate('/innovator/dashboard');
        } catch (err) {
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e, action) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    return (
        <div className="auth-wrapper">
            <div id="container" className={`container ${isSignIn ? "sign-in" : "sign-up"}`}>
                {/* FORM SECTION */}
                <div className="row">
                    {/* SIGN UP */}
                    <div className="col align-items-center flex-col sign-up">
                        <div className="form-wrapper align-items-center">
                            <div className="form sign-up" onKeyDown={(e) => handleKeyDown(e, handleRegister)}>
                                <div className="input-group">
                                    <i><User size={20} /></i>
                                    <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i><Mail size={20} /></i>
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i><Lock size={20} /></i>
                                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i><Lock size={20} /></i>
                                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>

                                {error && <p className="text-red-500 text-xs mb-2" style={{ color: 'red', margin: '0.5rem 0', fontSize: '0.8rem' }}>{error}</p>}

                                <button onClick={handleRegister} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign up"}
                                </button>
                                <p>
                                    <span>Already have an account? </span>
                                    <b onClick={toggle} className="pointer">
                                        Sign in here
                                    </b>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SIGN IN */}
                    <div className="col align-items-center flex-col sign-in">
                        <div className="form-wrapper align-items-center">
                            <div className="form sign-in" onKeyDown={(e) => handleKeyDown(e, handleLogin)}>
                                <div className="input-group">
                                    <i><Mail size={20} /></i>
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i><Lock size={20} /></i>
                                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                {error && <p className="text-red-500 text-xs mb-2" style={{ color: 'red', margin: '0.5rem 0', fontSize: '0.8rem' }}>{error}</p>}

                                <button onClick={handleLogin} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign in"}
                                </button>
                                <p>
                                    <b>Forgot password?</b>
                                </p>
                                <p>
                                    <span>Don't have an account? </span>
                                    <b onClick={toggle} className="pointer">
                                        Sign up here
                                    </b>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className="row content-row">
                    {/* SIGN IN CONTENT */}
                    <div className="col align-items-center flex-col">
                        <div className="text sign-in">
                            <h2>Welcome</h2>
                            <p>To keep connected with us please login with your personal info</p>
                        </div>
                    </div>

                    {/* SIGN UP CONTENT */}
                    <div className="col align-items-center flex-col">
                        <div className="text sign-up">
                            <h2>Join with us</h2>
                            <p>Enter your personal details and start your journey with us</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
