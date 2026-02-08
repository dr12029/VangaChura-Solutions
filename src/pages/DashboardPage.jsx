import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfileSection from "../components/ProfileSection";
import GroupsSection from "../components/GroupsSection";
import HistorySection from "../components/HistorySection";
import { FaUser, FaUsers, FaHistory, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const TABS = [
    { key: "profile", label: "Profile", icon: FaUser },
    { key: "groups", label: "Groups", icon: FaUsers },
    { key: "history", label: "History", icon: FaHistory },
];

export default function DashboardPage() {
    const { user, profile, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("profile");

    const displayName = profile?.studentName || profile?.displayName || user?.displayName || "User";

    async function handleLogout() {
        await logout();
        navigate("/");
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 border-b border-gray-200/60">
                <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 flex items-center justify-between">
                    <div className="min-w-0">
                        <h1 className="font-space text-xl sm:text-2xl font-bold text-gray-800 truncate">
                            Welcome, {displayName}
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">{user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-all duration-200 cursor-pointer px-3 py-2 rounded-xl hover:bg-indigo-50"
                            >
                                <FaShieldAlt size={14} />
                                <span className="hidden sm:inline">Admin</span>
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-all duration-200 cursor-pointer px-3 py-2 rounded-xl hover:bg-red-50"
                        >
                            <FaSignOutAlt size={14} />
                            <span className="hidden sm:inline">Log Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200/60 sticky top-16 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex">
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${tab === key
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {tab === "profile" && <ProfileSection />}
                {tab === "groups" && <GroupsSection />}
                {tab === "history" && <HistorySection />}
            </div>
        </motion.div>
    );
}
