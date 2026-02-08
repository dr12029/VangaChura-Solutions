import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
} from "../services/firestoreService";
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";

function sectionFromRoll(roll) {
    if (!roll || roll.length < 3) return "";
    const last3 = parseInt(roll.slice(-3), 10);
    if (isNaN(last3)) return "";
    if (last3 <= 60) return "A";
    if (last3 <= 120) return "B";
    if (last3 <= 181) return "C";
    return "";
}

export default function GroupsSection() {
    const { user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editMembers, setEditMembers] = useState([]);

    useEffect(() => {
        loadGroups();
    }, [user]);

    async function loadGroups() {
        if (!user) return;
        setLoading(true);
        const data = await getGroups(user.uid);
        setGroups(data);
        setLoading(false);
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!newName.trim()) return;
        await createGroup(user.uid, newName.trim(), []);
        setNewName("");
        setShowCreate(false);
        await loadGroups();
    }

    async function handleDelete(groupId) {
        if (!confirm("Delete this group?")) return;
        await deleteGroup(user.uid, groupId);
        await loadGroups();
    }

    function startEdit(group) {
        setEditingId(group.id);
        setEditMembers(
            group.members && group.members.length > 0
                ? group.members.map((m) => ({ ...m }))
                : [{ name: "", roll: "", section: "" }]
        );
    }

    function addMemberRow() {
        setEditMembers([...editMembers, { name: "", roll: "", section: "" }]);
    }

    function removeMemberRow(idx) {
        setEditMembers(editMembers.filter((_, i) => i !== idx));
    }

    function updateMemberField(idx, field, value) {
        const updated = [...editMembers];
        updated[idx] = { ...updated[idx], [field]: value };
        if (field === "roll") {
            const sec = sectionFromRoll(value);
            if (sec) updated[idx].section = sec;
        }
        setEditMembers(updated);
    }

    async function handleSaveMembers(groupId) {
        const cleaned = editMembers.filter(
            (m) => m.name.trim() || m.roll.trim()
        );
        await updateGroup(user.uid, groupId, { members: cleaned });
        setEditingId(null);
        await loadGroups();
    }

    const inputClass =
        "border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    if (loading) {
        return <p className="text-gray-500 text-sm">Loading groups…</p>;
    }

    return (
        <div className="max-w-2xl space-y-4">
            <p className="text-sm text-gray-500">
                Create groups of students. Select a group when generating cover pages to batch-generate for all members.
            </p>

            {/* Create button */}
            {!showCreate ? (
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                    <FaPlus size={12} /> New Group
                </button>
            ) : (
                <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                        type="text"
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Group name (e.g. EEE Section A)"
                        className={inputClass + " flex-1"}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg cursor-pointer">
                        Create
                    </button>
                    <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer">
                        Cancel
                    </button>
                </form>
            )}

            {/* Groups list */}
            {groups.length === 0 && (
                <p className="text-gray-400 text-sm">No groups yet. Create one to get started.</p>
            )}

            {groups.map((group) => (
                <div key={group.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                    >
                        <div className="flex items-center gap-2">
                            {expandedId === group.id ? <FaChevronUp size={12} className="text-gray-400" /> : <FaChevronDown size={12} className="text-gray-400" />}
                            <span className="font-medium text-gray-800">{group.name}</span>
                            <span className="text-xs text-gray-400">
                                ({group.members?.length || 0} members)
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); startEdit(group); setExpandedId(group.id); }}
                                className="text-gray-400 hover:text-blue-600 cursor-pointer"
                                title="Edit members"
                            >
                                <FaEdit size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(group.id); }}
                                className="text-gray-400 hover:text-red-600 cursor-pointer"
                                title="Delete group"
                            >
                                <FaTrash size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded content */}
                    {expandedId === group.id && (
                        <div className="border-t border-gray-200 px-4 py-3">
                            {editingId === group.id ? (
                                /* Editing mode */
                                <div className="space-y-2">
                                    {editMembers.map((m, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={m.name}
                                                onChange={(e) => updateMemberField(idx, "name", e.target.value)}
                                                placeholder="Name"
                                                className={inputClass + " flex-1"}
                                            />
                                            <input
                                                type="text"
                                                value={m.roll}
                                                onChange={(e) => updateMemberField(idx, "roll", e.target.value)}
                                                placeholder="Roll"
                                                className={inputClass + " w-28"}
                                            />
                                            <input
                                                type="text"
                                                value={m.section}
                                                onChange={(e) => updateMemberField(idx, "section", e.target.value)}
                                                placeholder="Sec"
                                                className={inputClass + " w-16"}
                                            />
                                            <button
                                                onClick={() => removeMemberRow(idx)}
                                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 pt-1">
                                        <button onClick={addMemberRow} className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer flex items-center gap-1">
                                            <FaPlus size={10} /> Add Member
                                        </button>
                                        <div className="flex-1" />
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSaveMembers(group.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg cursor-pointer"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View mode */
                                <div>
                                    {group.members && group.members.length > 0 ? (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500 border-b">
                                                    <th className="py-1 font-medium">#</th>
                                                    <th className="py-1 font-medium">Name</th>
                                                    <th className="py-1 font-medium">Roll</th>
                                                    <th className="py-1 font-medium">Section</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.members.map((m, i) => (
                                                    <tr key={i} className="border-b border-gray-100">
                                                        <td className="py-1 text-gray-400">{i + 1}</td>
                                                        <td className="py-1">{m.name}</td>
                                                        <td className="py-1">{m.roll}</td>
                                                        <td className="py-1">{m.section}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No members yet. Click edit to add.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
