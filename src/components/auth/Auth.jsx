import React, { useEffect, useState } from "react";
import "./auth-style.css";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Auth = ({ role = "innovator", initialMode = "login" }) => {
    // Logic from previous Auth.jsx
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { login, register } = useAuth();
    const navigate = useNavigate();

    // New UI Logic
    const [isSignIn, setIsSignIn] = useState(initialMode === "login");
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Only set initial state once on mount to respect prop
        // Use timeout as per user snippet for animation kickoff, but respect mode
        const timer = setTimeout(() => {
            setIsSignIn(initialMode === "login");
            setInitialized(true);
        }, 200);
        return () => clearTimeout(timer);
    }, [initialMode]);

    const toggle = () => {
        setIsSignIn((prev) => !prev);
        setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login(email, password);
            // Navigate based on target role or user role
            if (role === 'funder') navigate('/funder/dashboard');
            else navigate('/innovator/dashboard');
        } catch (err) {
            setError("Invalid credentials or error logging in.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
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

    return (
        <div className="auth-wrapper">
            <div id="container" className={`container ${isSignIn ? "sign-in" : "sign-up"}`}>
                {/* FORM SECTION */}
                <div className="row">
                    {/* SIGN UP */}
                    <div className="col align-items-center flex-col sign-up">
                        <div className="form-wrapper align-items-center">
                            <form className="form sign-up" onSubmit={handleRegister}>
                                <div className="input-group">
                                    <i className="icon"><User size={20} /></i>
                                    <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i className="icon"><Mail size={20} /></i>
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i className="icon"><Lock size={20} /></i>
                                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i className="icon"><Lock size={20} /></i>
                                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>

                                {error && <p className="text-red-500 text-xs mb-2" style={{ color: 'red' }}>{error}</p>}

                                <button disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Sign up"}
                                </button>

                                <p>
                                    <span>Already have an account? </span>
                                    <b onClick={toggle} className="pointer">
                                        Sign in here
                                    </b>
                                </p>
                            </form>
                        </div>
                    </div>

                    {/* SIGN IN */}
                    <div className="col align-items-center flex-col sign-in">
                        <div className="form-wrapper align-items-center">
                            <form className="form sign-in" onSubmit={handleLogin}>
                                <div className="input-group">
                                    {/* User icon replaced with Mail if we are using email login, but user code had User icon. I'll use Mail for clarity since we bind to email state. */}
                                    <i className="icon"><Mail size={20} /></i>
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="input-group">
                                    <i className="icon"><Lock size={20} /></i>
                                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>

                                {error && <p className="text-red-500 text-xs mb-2" style={{ color: 'red' }}>{error}</p>}

                                <button disabled={loading}>
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
                            </form>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <div className="row content-row">
                    <div className="col align-items-center flex-col">
                        <div className="text sign-in">
                            <h2>Welcome</h2>
                            <p>To keep connected with us please login with your personal info</p>
                        </div>
                    </div>

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
