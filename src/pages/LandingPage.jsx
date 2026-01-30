import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute transform rotate-45 -left-1/4 -top-1/4 w-1/2 h-1/2 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl"></div>
                    <div className="absolute transform rotate-45 -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl"></div>
                </div>

                <div className="relative z-10 container mx-auto px-6 py-24">
                    {/* Header */}
                    <nav className="flex items-center justify-between mb-20">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                InnoFund
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Role-initiated flow: users should use the hero buttons below */}
                        </div>
                    </nav>

                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                            Where <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Innovation</span> Meets <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Funding</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            A collaborative R&D platform connecting visionary innovators with industry funders through smart contracts.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Link
                                    to="/innovator/register"
                                    className="group w-full sm:w-80 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-blue-500/30 flex items-center justify-center space-x-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <div className="text-left">
                                        <span className="block font-semibold text-lg">Continue as Innovator</span>
                                        <span className="block text-xs text-blue-200">Submit proposals & track R&D</span>
                                    </div>
                                </Link>
                                <Link to="/innovator/login" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                                    Already have an account? <span className="font-semibold underline">Log in</span>
                                </Link>
                            </div>

                            <div className="flex flex-col items-center space-y-4">
                                <Link
                                    to="/funder/register"
                                    className="group w-full sm:w-80 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/30 flex items-center justify-center space-x-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-left">
                                        <span className="block font-semibold text-lg">Continue as Funder</span>
                                        <span className="block text-xs text-purple-200">Invest in disruptive tech</span>
                                    </div>
                                </Link>
                                <Link to="/funder/login" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                                    Already have an account? <span className="font-semibold underline">Log in</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-6 py-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                    How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group p-8 bg-gray-800/50 rounded-3xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Submit Proposals</h3>
                        <p className="text-gray-400">Innovators submit detailed R&D proposals with milestones, budgets, and timelines.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group p-8 bg-gray-800/50 rounded-3xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Smart Contract Matching</h3>
                        <p className="text-gray-400">Funders review and fund proposals via secure smart contracts with milestone-based releases.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group p-8 bg-gray-800/50 rounded-3xl border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10">
                        <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Track Progress</h3>
                        <p className="text-gray-400">Both parties track milestones, receive updates, and manage funds transparently.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-12">
                <div className="container mx-auto px-6 text-center text-gray-500">
                    <p>&copy; 2026 InnoFund. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
