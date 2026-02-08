import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getHistory, deleteHistory } from "../services/firestoreService";
import { FaTrash, FaExternalLinkAlt, FaUsers, FaUser } from "react-icons/fa";

export default function HistorySection() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [user]);

    async function loadHistory() {
        if (!user) return;
        setLoading(true);
        const data = await getHistory(user.uid);
        setEntries(data);
        setLoading(false);
    }

    async function handleDelete(id) {
        if (!confirm("Delete this history entry?")) return;
        await deleteHistory(user.uid, id);
        await loadHistory();
    }

    function handleOpen(entry) {
        const params = new URLSearchParams();
        const fields = [
            "departmentName", "reportType", "courseCode", "courseTitle",
            "experimentNo", "experimentName", "studentName", "studentRoll",
            "section", "teacherName", "designation", "dateOfExperiment", "dateOfSubmission",
        ];
        fields.forEach((f) => {
            if (entry[f]) params.set(f, entry[f]);
        });
        // If it's a group entry, pass the groupId so the form selects it
        if (entry.isGroup && entry.groupId) {
            params.set("groupId", entry.groupId);
        }
        navigate(`/cover-page?${params.toString()}`);
    }

    if (loading) {
        return <p className="text-gray-500 text-sm">Loading history…</p>;
    }

    if (entries.length === 0) {
        return (
            <div className="text-gray-400 text-sm">
                No cover pages generated yet. Your history will appear here.
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-3">
            <p className="text-sm text-gray-500 mb-2">
                Click any entry to re-open it in the cover page generator.
            </p>
            {entries.map((e) => (
                <div
                    key={e.id}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-blue-300 transition-colors"
                >
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleOpen(e)}>
                        <div className="flex items-center gap-2 flex-wrap">
                            {e.isGroup ? (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                    <FaUsers size={10} />
                                    {e.groupName || "Group"}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-gray-400 text-xs">
                                    <FaUser size={9} />
                                </span>
                            )}
                            <span className="font-medium text-gray-800 text-sm">
                                {e.courseCode || "—"}
                            </span>
                            <span className="text-gray-400 text-xs">•</span>
                            <span className="text-gray-600 text-sm truncate">
                                {e.courseTitle || "Untitled"}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{e.reportType || "—"}</span>
                            <span>Exp/Asgn #{e.experimentNo || "—"}</span>
                            {e.isGroup ? (
                                <span>{e.memberCount || 0} members</span>
                            ) : (
                                <span>{e.studentName || "—"} ({e.studentRoll || "—"})</span>
                            )}
                            {e.createdAt?.toDate && (
                                <span>{e.createdAt.toDate().toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                        <button
                            onClick={() => handleOpen(e)}
                            className="text-gray-400 hover:text-blue-600 cursor-pointer"
                            title="Open"
                        >
                            <FaExternalLinkAlt size={13} />
                        </button>
                        <button
                            onClick={() => handleDelete(e.id)}
                            className="text-gray-400 hover:text-red-600 cursor-pointer"
                            title="Delete"
                        >
                            <FaTrash size={13} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
