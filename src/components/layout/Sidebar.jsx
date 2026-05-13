import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, CircleDot, Weight, CopyCheck,
    Flame, Users, History, Menu, X, LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/spin/normal', icon: CircleDot, label: 'Spin Normal' },
    { path: '/spin/weighted', icon: Weight, label: 'Weighted Spin' },
    { path: '/spin/double', icon: CopyCheck, label: 'Double Spin' },
    { path: '/spin/truth-or-dare', icon: Flame, label: 'Truth or Dare' },
    { path: '/rooms', icon: Users, label: 'Rooms' },
    { path: '/history', icon: History, label: 'Riwayat' },
];

export default function Sidebar() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { logout } = useAuth();
    const handleLogout = () => logout();

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border/30">
                <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
                        <CircleDot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-heading font-bold text-lg text-foreground">Spin Decide</h1>
                        <p className="text-xs text-muted-foreground">Pilih dengan Putar</p>
                    </div>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                                    ? 'bg-primary/15 text-primary glow-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border/30">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 h-screen bg-sidebar border-r border-border/30 flex-col fixed left-0 top-0 z-40">
                <NavContent />
            </aside>

            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border/30"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-border/30 z-50 lg:hidden"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <NavContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}