import { Link } from "react-router-dom";
import { FaFileAlt, FaUsers, FaCloudDownloadAlt, FaBolt } from "react-icons/fa";
import { motion } from "framer-motion";

const features = [
    { icon: FaFileAlt, title: "Cover Pages", desc: "Generate professional lab report & assignment covers in seconds" },
    { icon: FaUsers, title: "Group Mode", desc: "Batch generate cover pages for your entire group at once" },
    { icon: FaCloudDownloadAlt, title: "PDF Export", desc: "Download as PDF or print directly from your browser" },
    { icon: FaBolt, title: "Smart Auto-fill", desc: "Remembers your courses, teachers, and student info" },
];

export default function HomePage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center px-4 pt-20 pb-12 sm:pt-28 sm:pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center"
                >
                    <h1 className="font-space text-4xl sm:text-6xl font-bold tracking-tight mb-4">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Vangachura</span>{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">Solutions</span>
                    </h1>
                    <p className="text-gray-500 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
                        Your one-stop toolkit for RUET academic documents. Generate professional cover pages in seconds.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link
                        to="/cover-page"
                        className="btn-primary inline-flex items-center gap-2.5 px-8 py-3.5 text-lg"
                    >
                        <FaFileAlt />
                        Generate Cover Page
                    </Link>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="max-w-4xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                            className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3">
                                <f.icon className="text-white" size={18} />
                            </div>
                            <h3 className="font-space font-semibold text-gray-800 mb-1">{f.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
