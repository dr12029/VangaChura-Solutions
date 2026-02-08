import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="no-print sticky top-0 z-50 bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 border-b border-gray-200/60 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-1 font-space text-2xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vangachura</span>
                        <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Solutions</span>
                    </Link>

                    {/* Desktop right side */}
                    <div className="hidden sm:flex items-center gap-3">
                        <Link
                            to="/cover-page"
                            className="btn-primary px-5 py-2 text-sm"
                        >
                            Generate Cover Page
                        </Link>
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 px-3 py-1.5 rounded-xl hover:bg-blue-50/60"
                            >
                                <FaUserCircle size={24} />
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="btn-outline px-5 py-2 text-sm"
                            >
                                Log In
                            </Link>
                        )}
                    </div>

                    {/* Hamburger button (mobile) */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="sm:hidden text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <HiX size={26} /> : <HiMenu size={26} />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="sm:hidden border-t border-gray-200/60 bg-white/80 backdrop-blur-md px-4 pb-4 pt-2 space-y-3 overflow-hidden"
                    >
                        <Link
                            to="/cover-page"
                            onClick={() => setOpen(false)}
                            className="block btn-primary px-4 py-2.5 text-sm text-center"
                        >
                            Generate Cover Page
                        </Link>
                        {user ? (
                            <Link
                                to="/dashboard"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors w-full px-4 py-2 rounded-xl hover:bg-blue-50/60"
                            >
                                <FaUserCircle size={22} />
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setOpen(false)}
                                className="block btn-outline px-4 py-2.5 text-sm text-center"
                            >
                                Log In
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
