import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile as updateFirestoreProfile } from "../services/firestoreService";
import { FaEdit } from "react-icons/fa";

const DEPARTMENTS = [
    "Electrical & Electronic Engineering (EEE)",
    "Computer Science & Engineering (CSE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Electronics & Telecommunication Engineering (ETE)",
    "Industrial & Production Engineering (IPE)",
    "Glass & Ceramic Engineering (GCE)",
    "Mechatronics Engineering (MTE)",
    "Electrical & Computer Engineering (ECE)",
    "Chemical Engineering (ChE)",
    "Materials Science & Engineering (MSE)",
    "Building Engineering & Construction Management (BECM)",
];

function sectionFromRoll(roll) {
    if (!roll || roll.length < 3) return "";
    const last3 = parseInt(roll.slice(-3), 10);
    if (isNaN(last3)) return "";
    if (last3 <= 60) return "A";
    if (last3 <= 120) return "B";
    if (last3 <= 181) return "C";
    return "";
}

export default function ProfileSection() {
    const { user, profile, refreshProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        studentName: "",
        studentRoll: "",
        section: "",
        departmentName: "",
    });
    const [saving, setSaving] = useState(false);

    const hasProfile = profile && (profile.studentName || profile.studentRoll);

    useEffect(() => {
        if (profile) {
            setForm({
                studentName: profile.studentName || "",
                studentRoll: profile.studentRoll || "",
                section: profile.section || "",
                departmentName: profile.departmentName || "",
            });
        }
        // If no profile data, start in editing mode
        if (!hasProfile) setEditing(true);
    }, [profile]);

    function handleRollChange(val) {
        const updated = { ...form, studentRoll: val };
        const sec = sectionFromRoll(val);
        if (sec) updated.section = sec;
        setForm(updated);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateFirestoreProfile(user.uid, {
                ...form,
                displayName: form.studentName, // keep displayName in sync
            });
            await refreshProfile();
            toast.success("Profile saved successfully!");
            setEditing(false);
        } catch (err) {
            toast.error(err.message || "Failed to save profile");
        }
        setSaving(false);
    }

    const inputClass =
        "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    /* ─── View mode ─── */
    if (hasProfile && !editing) {
        const fields = [
            { label: "Name", value: profile.studentName },
            { label: "Roll", value: profile.studentRoll },
            { label: "Section", value: profile.section },
            { label: "Department", value: profile.departmentName },
        ];

        return (
            <div className="max-w-lg">
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-gray-500">
                        Your details are auto-filled when generating cover pages.
                    </p>
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer shrink-0 ml-4"
                    >
                        <FaEdit size={13} />
                        Edit Profile
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {fields.map(({ label, value }) => (
                        <div key={label} className="flex items-center px-4 py-3 sm:px-5">
                            <span className="text-sm font-medium text-gray-500 w-28 sm:w-32 shrink-0">{label}</span>
                            <span className="text-sm text-gray-800">{value || "—"}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ─── Edit mode ─── */
    return (
        <form onSubmit={handleSave} className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {hasProfile ? "Update your details below." : "Fill in your details once. They'll be auto-filled when you generate cover pages."}
                </p>
                {hasProfile && (
                    <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer shrink-0 ml-4"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                    type="text"
                    value={form.studentName}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    className={inputClass}
                    placeholder="Md. Example"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Roll</label>
                <input
                    type="text"
                    value={form.studentRoll}
                    onChange={(e) => handleRollChange(e.target.value)}
                    className={inputClass}
                    placeholder="2201059"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                    type="text"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className={inputClass}
                    placeholder="A"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                    value={form.departmentName}
                    onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                    className={inputClass + " cursor-pointer"}
                >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
                {saving ? "Saving…" : hasProfile ? "Update Profile" : "Save Profile"}
            </button>
        </form>
    );
}
