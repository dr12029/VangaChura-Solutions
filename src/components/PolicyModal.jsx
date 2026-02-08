import { motion, AnimatePresence } from "framer-motion";
import { HiX } from "react-icons/hi";

export default function PolicyModal({ open, onClose }) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[80vh] flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="font-space text-lg font-bold text-gray-800">
                                    Privacy Policy & Terms of Use
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    <HiX size={22} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                                    Last updated: February 2026
                                </p>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        1. Information We Collect
                                    </h3>
                                    <p>
                                        When you create an account on Vangachura Solutions, we collect
                                        your <strong>name</strong>, <strong>email address</strong>, and
                                        any additional profile information you provide (such as student
                                        roll number, section, and department). We also record metadata
                                        related to cover pages you generate using the platform.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        2. How We Use Your Information
                                    </h3>
                                    <p>
                                        Your data is used solely to provide and improve the services
                                        offered by this platform. The developer may access user data
                                        (name, email, usage statistics) for administrative, analytical,
                                        and debugging purposes only.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        3. No Selling or Sharing of Data
                                    </h3>
                                    <p>
                                        We do <strong>not</strong> sell, trade, or share your personal
                                        information with any third parties under any circumstances. Your
                                        data remains strictly within the platform's infrastructure.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        4. Data Security & Risk Acknowledgement
                                    </h3>
                                    <p>
                                        Vangachura Solutions is an independently developed project and is
                                        not maintained by a professional team or organisation. While we
                                        take reasonable measures to protect your data, we cannot
                                        guarantee absolute security. The platform is provided on an{" "}
                                        <strong>"as-is"</strong> basis.
                                    </p>
                                    <p className="mt-2">
                                        By creating an account, you acknowledge and accept the inherent
                                        risks associated with storing data on an independently maintained
                                        platform — including, but not limited to, potential data breaches
                                        or service interruptions. The developer shall not be held liable
                                        for any data loss, leaks, or damages arising from the use of
                                        this service.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        5. Data Deletion
                                    </h3>
                                    <p>
                                        You may request the deletion of your account and all associated
                                        data at any time by contacting the developer. We will make
                                        reasonable efforts to fulfil such requests promptly.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        6. Consent
                                    </h3>
                                    <p>
                                        By checking the agreement box during sign-up, you confirm that
                                        you have read, understood, and agree to these terms. If you do
                                        not agree, please do not create an account.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        7. Changes to This Policy
                                    </h3>
                                    <p>
                                        We reserve the right to update this policy at any time. Continued
                                        use of the platform after changes constitutes acceptance of the
                                        revised terms.
                                    </p>
                                </section>

                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        For questions or data deletion requests, contact:{" "}
                                        <a
                                            href="mailto:shyatavanga@gmail.com"
                                            className="text-blue-500 hover:underline"
                                        >
                                            shyatavanga@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="btn-primary px-5 py-2 text-sm"
                                >
                                    I Understand
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
