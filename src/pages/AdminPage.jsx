import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAllUsers, getUserHistoryCount } from "../services/firestoreService";
import { motion } from "framer-motion";
import {
    FaUsers,
    FaFileAlt,
    FaArrowLeft,
    FaSpinner,
    FaSearch,
    FaSortAmountDown,
    FaSortAmountUp,
} from "react-icons/fa";

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("createdAt");
    const [sortAsc, setSortAsc] = useState(false);

    useEffect(() => {
        if (!isAdmin) return;

        async function fetchData() {
            try {
                const allUsers = await getAllUsers();
                // Fetch history counts in parallel
                const enriched = await Promise.all(
                    allUsers.map(async (u) => {
                        const coversGenerated = await getUserHistoryCount(u.uid);
                        return { ...u, coversGenerated };
                    })
                );
                setUsers(enriched);
            } catch (err) {
                console.error("Admin fetch error:", err);
            }
            setLoading(false);
        }

        fetchData();
    }, [isAdmin]);

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <p className="text-gray-500">Please log in first.</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-semibold text-lg">⛔ Access Denied</p>
                <p className="text-gray-500 text-sm">You do not have admin privileges.</p>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-primary px-5 py-2 text-sm"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    // Filter & sort
    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return (
            (u.displayName || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.studentName || "").toLowerCase().includes(q) ||
            (u.studentRoll || "").toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        let valA, valB;
        if (sortKey === "coversGenerated") {
            valA = a.coversGenerated || 0;
            valB = b.coversGenerated || 0;
        } else if (sortKey === "createdAt") {
            valA = a.createdAt || "";
            valB = b.createdAt || "";
        } else if (sortKey === "name") {
            valA = (a.studentName || a.displayName || "").toLowerCase();
            valB = (b.studentName || b.displayName || "").toLowerCase();
        } else {
            valA = (a[sortKey] || "").toString().toLowerCase();
            valB = (b[sortKey] || "").toString().toLowerCase();
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    function toggleSort(key) {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    }

    const SortIcon = sortAsc ? FaSortAmountUp : FaSortAmountDown;

    const totalCovers = users.reduce((sum, u) => sum + (u.coversGenerated || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 border-b border-gray-200/60">
                <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-space text-xl sm:text-2xl font-bold text-gray-800">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            User statistics & analytics
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-all duration-200 cursor-pointer px-3 py-2 rounded-xl hover:bg-blue-50"
                    >
                        <FaArrowLeft size={14} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-blue-500" size={28} />
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                icon={FaUsers}
                                label="Total Users"
                                value={users.length}
                                color="blue"
                            />
                            <StatCard
                                icon={FaFileAlt}
                                label="Total Covers Generated"
                                value={totalCovers}
                                color="indigo"
                            />
                            <StatCard
                                icon={FaFileAlt}
                                label="Avg Covers / User"
                                value={
                                    users.length > 0
                                        ? (totalCovers / users.length).toFixed(1)
                                        : 0
                                }
                                color="emerald"
                            />
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, or roll…"
                                className="input-modern pl-9 w-full sm:max-w-md"
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50/80 text-gray-600 text-xs uppercase tracking-wider">
                                            <th className="px-4 py-3 text-left">#</th>
                                            <th
                                                className="px-4 py-3 text-left cursor-pointer hover:text-blue-600 select-none"
                                                onClick={() => toggleSort("name")}
                                            >
                                                <span className="flex items-center gap-1">
                                                    Name
                                                    {sortKey === "name" && <SortIcon size={12} />}
                                                </span>
                                            </th>
                                            <th className="px-4 py-3 text-left">Email</th>
                                            <th className="px-4 py-3 text-left">Roll</th>
                                            <th className="px-4 py-3 text-left">Section</th>
                                            <th className="px-4 py-3 text-left">Department</th>
                                            <th
                                                className="px-4 py-3 text-left cursor-pointer hover:text-blue-600 select-none"
                                                onClick={() => toggleSort("coversGenerated")}
                                            >
                                                <span className="flex items-center gap-1">
                                                    Covers
                                                    {sortKey === "coversGenerated" && <SortIcon size={12} />}
                                                </span>
                                            </th>
                                            <th
                                                className="px-4 py-3 text-left cursor-pointer hover:text-blue-600 select-none"
                                                onClick={() => toggleSort("createdAt")}
                                            >
                                                <span className="flex items-center gap-1">
                                                    Joined
                                                    {sortKey === "createdAt" && <SortIcon size={12} />}
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sorted.map((u, idx) => (
                                            <tr
                                                key={u.uid}
                                                className="hover:bg-blue-50/40 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                                                    {u.studentName || u.displayName || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                    {u.email || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {u.studentRoll || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {u.section || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                    {u.departmentName || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-800 font-semibold">
                                                    {u.coversGenerated}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                    {u.createdAt
                                                        ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                        {sorted.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                                                    {search ? "No users match your search." : "No users found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50",
        indigo: "from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50",
        emerald: "from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50",
    };
    const c = colors[color] || colors.blue;
    const [gradientPart, textPart, bgPart] = [
        c.split(" ").slice(0, 2).join(" "),
        c.split(" ")[2],
        c.split(" ")[3],
    ];

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md shadow-gray-200/40 border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bgPart} flex items-center justify-center`}>
                <Icon className={textPart} size={20} />
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
