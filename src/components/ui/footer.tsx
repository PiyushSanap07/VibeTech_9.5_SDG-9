import React from 'react';
import { Link } from 'react-router-dom';
import { Grid2X2Icon } from 'lucide-react';
import { Icons } from './icons';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: 'Platform',
            links: [
                { label: 'Browse Projects', href: '/projects' },
                { label: 'How it Works', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
            ],
        },
        {
            title: 'Resources',
            links: [
                { label: 'Documentation', href: '/docs' },
                { label: 'Help Center', href: '/help' },
                { label: 'Community', href: '/community' },
            ],
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '#about' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contact', href: '/contact' },
            ],
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
            ],
        },
    ];

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <Grid2X2Icon className="size-6 text-primary-600" />
                            <span className="text-xl font-bold text-primary-600">InnoFund</span>
                        </Link>
                        <p className="text-slate-500 max-w-xs mb-6">
                            Where Visionary Innovators Meet Strategic Funding.
                            Secure, transparent, and efficient R&D funding powered by blockchain.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                                <Icons.twitter className="size-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                                <Icons.gitHub className="size-5" />
                            </a>
                        </div>
                    </div>

                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="font-semibold text-slate-900 mb-4">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-slate-500 hover:text-primary-600 transition-colors text-sm"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm italic font-['Open_Sans']">
                        &copy; {currentYear} InnoFund. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                            System Status: Operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
