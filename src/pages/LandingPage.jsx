import React from 'react';
import { Link } from 'react-router-dom';
import { Particles } from '../components/ui/particles';
import { TypingText } from '../components/ui/typing-text';
import { FloatingHeader } from '../components/ui/floating-header';
import { Testimonials } from '../components/ui/testimonials';
import { Footer } from '../components/ui/footer';

const testimonials = [
    {
        image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop',
        text: "InnoFund transformed how we secure research funding. The smart contract transparency is a game-changer.",
        name: 'Dr. Sarah Chen',
        username: '@sarahchen_lab',
        social: 'https://twitter.com/sarahchen'
    },
    {
        image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop',
        text: "As a funder, I love the milestone-based release system. It reduces risk and ensures progress is being made.",
        name: 'Marcus Thorne',
        username: '@mthorne_invests',
        social: 'https://twitter.com/mthorne'
    },
    {
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1780&auto=format&fit=crop',
        text: "The platform is incredibly intuitive. We got our project funded within three weeks of posting our proposal.",
        name: 'Alex Rivera',
        username: '@arivera_tech',
        social: 'https://twitter.com/arivera'
    },
    {
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1780&auto=format&fit=crop',
        text: "Security and efficiency combined. InnoFund is the future of collaborative R&D funding.",
        name: 'Elena Rodriguez',
        username: '@elena_rd_leads',
        social: 'https://twitter.com/elena'
    },
    {
        image: 'https://images.unsplash.com/photo-15c6dbe624250-7f2a1e3438c8?q=80&w=1780&auto=format&fit=crop',
        text: "Integrates perfectly with our existing workflow. The dashboard provides all the insights we need.",
        name: 'David Wilson',
        username: '@dwilson_ventures',
        social: 'https://twitter.com/david'
    },
    {
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1780&auto=format&fit=crop',
        text: "Finally a place where deep tech meets the right investors. Highly recommended for any serious innovator.",
        name: 'James K. Smith',
        username: '@jsmith_quantum',
        social: 'https://twitter.com/jsmith'
    }
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white text-[#000000] relative overflow-hidden font-sans">
            {/* Green particles – full page */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Particles
                    className="absolute inset-0 size-full min-h-screen"
                    quantity={220}
                    staticity={40}
                    ease={60}
                    size={1.1}
                    color="#0EA5E9"
                    vx={0.2}
                    vy={0.1}
                />
            </div>
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute transform rotate-45 -left-1/4 -top-1/4 w-1/2 h-1/2 bg-[#0EA5E9] blur-3xl"></div>
                    <div className="absolute transform rotate-45 -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-[#38BDF8] blur-3xl"></div>
                </div>

                <div className="relative z-50 container mx-auto px-6 py-4">
                    <FloatingHeader />
                </div>

                <div className="relative z-10 container mx-auto px-6 py-24">
                    {/* Hero Content */}
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight min-h-[1.2em]">
                            <TypingText
                                text="Where Innovation Meets Funding"
                                speed={80}
                                startDelay={400}
                                className="text-[#0EA5E9]"
                            />
                        </h1>
                        <p className="text-xl md:text-2xl text-[#757575] mb-12 max-w-2xl mx-auto min-h-[1.5em]">
                            <TypingText
                                text="A collaborative R&D platform connecting visionary innovators with industry funders through smart contracts."
                                speed={35}
                                startDelay={1200}
                                className="text-[#757575]"
                            />
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Link
                                    to="/innovator/register"
                                    className="group w-full sm:w-80 px-8 py-4 bg-[#0EA5E9] hover:bg-[#38BDF8] rounded-2xl transition-all duration-300 shadow-xl shadow-[#0EA5E9]/30 flex items-center justify-center space-x-3 text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <div className="text-left">
                                        <span className="block font-semibold text-lg">Continue as Innovator</span>
                                        <span className="block text-xs text-white/90">Submit proposals & track R&D</span>
                                    </div>
                                </Link>
                                <Link to="/innovator/login" className="text-[#757575] hover:text-[#0EA5E9] text-sm transition-colors">
                                    Already have an account? <span className="font-semibold underline">Log in</span>
                                </Link>
                            </div>

                            <div className="flex flex-col items-center space-y-4">
                                <Link
                                    to="/funder/register"
                                    className="group w-full sm:w-80 px-8 py-4 bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-2xl transition-all duration-300 shadow-xl shadow-[#38BDF8]/30 flex items-center justify-center space-x-3 text-white"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-left">
                                        <span className="block font-semibold text-lg">Continue as Funder</span>
                                        <span className="block text-xs text-white/90">Invest in disruptive tech</span>
                                    </div>
                                </Link>
                                <Link to="/funder/login" className="text-[#757575] hover:text-[#0EA5E9] text-sm transition-colors">
                                    Already have an account? <span className="font-semibold underline">Log in</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="container mx-auto px-6 py-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-[#000000]">
                    How It <span className="text-[#0EA5E9]">Works</span>
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group p-8 bg-white rounded-3xl border border-[#efefef] hover:border-[#0EA5E9]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#0EA5E9]/10">
                        <div className="w-14 h-14 bg-[#0EA5E9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#0EA5E9]/20">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#000000]">Submit Proposals</h3>
                        <p className="text-[#757575]">Innovators submit detailed R&D proposals with milestones, budgets, and timelines.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group p-8 bg-white rounded-3xl border border-[#efefef] hover:border-[#0EA5E9]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#0EA5E9]/10">
                        <div className="w-14 h-14 bg-[#38BDF8] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#38BDF8]/20">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#000000]">Smart Contract Matching</h3>
                        <p className="text-[#757575]">Funders review and fund proposals via secure smart contracts with milestone-based releases.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group p-8 bg-white rounded-3xl border border-[#efefef] hover:border-[#38BDF8]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#38BDF8]/10">
                        <div className="w-14 h-14 bg-[#0EA5E9] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#0EA5E9]/20">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-[#000000]">Track Progress</h3>
                        <p className="text-[#757575]">Both parties track milestones, receive updates, and manage funds transparently.</p>
                    </div>
                </div>
            </div>

            {/* Testimonials Slider Section */}
            <div id="pricing" className="bg-slate-50/50 py-24">
                <Testimonials
                    testimonials={testimonials}
                    title="Trusted by Innovators & Funders"
                    description="Join the community of researchers and investors shaping the future of technology.<br />See what they have to say about InnoFund."
                    isSlider={true}
                />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default LandingPage;
