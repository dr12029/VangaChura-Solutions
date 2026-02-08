import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuth } from "../contexts/AuthContext";
import { getGroups } from "../services/firestoreService";
import { addHistory } from "../services/firestoreService";
import { getTeacherCourses, saveTeacherCourse } from "../services/firestoreService";
import { getTeacherNames, findTeacher } from "../data/teachers";
import {
    getCourseCodes,
    getCourseTitles,
    findCourseByCode,
    findCourseByTitle,
    getExperimentNos,
    findExperimentName,
    deptAbbr,
    seriesFromRoll,
    padExpNo,
} from "../data/courses";

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

const COVER_TYPES = ["LAB Report", "Assignment"];

/* ---------- localStorage helpers for course memory ---------- */
const STORAGE_KEY = "ruet_cover_courses";
const STUDENTS_KEY = "ruet_cover_students";

function getSavedCourses() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCourse(code, title) {
    if (!code && !title) return;
    const courses = getSavedCourses();
    const exists = courses.findIndex(
        (c) => c.code.toLowerCase() === code.toLowerCase()
    );
    if (exists >= 0) {
        courses[exists] = { code, title };
    } else {
        courses.push({ code, title });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

/* ---------- localStorage helpers for student name/roll memory ---------- */
function getSavedStudents() {
    try {
        return JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveStudent(name, roll) {
    if (!name && !roll) return;
    const students = getSavedStudents();
    const exists = students.findIndex(
        (s) => s.roll && s.roll.toLowerCase() === roll.toLowerCase()
    );
    if (exists >= 0) {
        students[exists] = { name, roll };
    } else {
        students.push({ name, roll });
    }
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

/* ---------- Section from roll helper ---------- */
function sectionFromRoll(roll) {
    if (!roll || roll.length < 3) return "";
    const last3 = parseInt(roll.slice(-3), 10);
    if (isNaN(last3)) return "";
    if (last3 <= 60) return "A";
    if (last3 <= 120) return "B";
    if (last3 <= 181) return "C";
    return "";
}

/* ---------- localStorage helpers for teacher-course pairing ---------- */
const TEACHER_COURSES_KEY = "ruet_cover_teacher_courses";

function getSavedTeacherCourses() {
    try {
        return JSON.parse(localStorage.getItem(TEACHER_COURSES_KEY)) || [];
    } catch {
        return [];
    }
}

function saveTeacherCourseLocal(courseCode, teacherName) {
    if (!courseCode || !teacherName) return;
    const pairings = getSavedTeacherCourses();
    const key = courseCode.toLowerCase();
    const exists = pairings.findIndex((p) => p.courseCode.toLowerCase() === key);
    if (exists >= 0) {
        pairings[exists] = { courseCode, teacherName };
    } else {
        pairings.push({ courseCode, teacherName });
    }
    localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(pairings));
}

function findTeacherForCourse(courseCode) {
    if (!courseCode) return null;
    const pairings = getSavedTeacherCourses();
    return pairings.find((p) => p.courseCode.toLowerCase() === courseCode.toLowerCase()) || null;
}

/* ---------- Autocomplete dropdown component ---------- */
function AutocompleteInput({ value, onChange, suggestions, placeholder, className }) {
    const [open, setOpen] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (value) {
            const lower = value.toLowerCase();
            setFiltered(suggestions.filter((s) => s.toLowerCase().includes(lower)));
        } else {
            setFiltered(suggestions);
        }
    }, [value, suggestions]);

    useEffect(() => {
        function handleClick(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className={className}
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg text-sm">
                    {filtered.map((item, i) => (
                        <li
                            key={i}
                            className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer"
                            onMouseDown={() => {
                                onChange(item);
                                setOpen(false);
                            }}
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function InputForm({ data, onChange, initialGroupId }) {
    const { user } = useAuth();
    const [courseSuggestions, setCourseSuggestions] = useState({ codes: [], titles: [] });
    const [studentSuggestions, setStudentSuggestions] = useState({ names: [], rolls: [] });
    const [experimentSuggestions, setExperimentSuggestions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || "");
    const [downloading, setDownloading] = useState(false);
    const [firestoreTeacherCourses, setFirestoreTeacherCourses] = useState([]);

    // Ref always holds the latest data so blur handlers never read stale state
    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);

    // One-time cleanup: remove junk partial entries from localStorage
    useEffect(() => {
        // Clean courses: keep only entries where code looks like a valid course code (has a space + digit)
        try {
            const courses = getSavedCourses();
            const cleaned = courses.filter((c) => c.code && /^[A-Z]{2,5}\s\d{3,5}$/i.test(c.code.trim()));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        } catch { /* ignore */ }
        // Clean students: keep only entries where roll is at least 5 digits
        try {
            const students = getSavedStudents();
            const seen = new Set();
            const cleaned = students.filter((s) => {
                if (!s.roll || s.roll.length < 5) return false;
                const key = s.roll.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            localStorage.setItem(STUDENTS_KEY, JSON.stringify(cleaned));
        } catch { /* ignore */ }
    }, []);

    // Load saved data on mount
    useEffect(() => {
        refreshCourseSuggestions();
        refreshStudentSuggestions();
    }, []);

    // Load groups + teacher-course pairings if user is logged in
    useEffect(() => {
        if (user) {
            getGroups(user.uid).then(setGroups).catch(() => { });
            getTeacherCourses(user.uid).then(setFirestoreTeacherCourses).catch(() => { });
        }
    }, [user]);

    // Sync initialGroupId from URL params
    useEffect(() => {
        if (initialGroupId) setSelectedGroupId(initialGroupId);
    }, [initialGroupId]);

    const isGroupMode = !!selectedGroupId;

    // Build the current filter criteria for static course data
    function getCourseFilter() {
        const dept = deptAbbr(data.departmentName);

        if (isGroupMode) {
            // In group mode, check if ANY member matches dept + series + section
            const selectedGroup = groups.find((g) => g.id === selectedGroupId);
            const members = selectedGroup?.members || [];
            for (const member of members) {
                const roll = member.roll || "";
                const series = seriesFromRoll(roll);
                const section = member.section || sectionFromRoll(roll);
                if (dept && series && section) {
                    return { department: dept, series, section };
                }
            }
            return { department: dept || undefined, series: undefined, section: undefined };
        }

        const series = seriesFromRoll(data.studentRoll);
        const section = data.section || "";
        return { department: dept || undefined, series: series || undefined, section: section || undefined };
    }

    // Check whether all 3 filter fields (dept, series, section) are filled
    function isFilterComplete() {
        const f = getCourseFilter();
        return !!(f.department && f.series && f.section);
    }

    function refreshCourseSuggestions() {
        const localCourses = getSavedCourses();
        const localCodes = localCourses.map((c) => c.code).filter(Boolean);
        const localTitles = localCourses.map((c) => c.title).filter(Boolean);
        // Only show static course suggestions when dept + series + section are ALL set
        let staticCodes = [];
        let staticTitles = [];
        if (isFilterComplete()) {
            const filter = getCourseFilter();
            staticCodes = getCourseCodes(filter);
            staticTitles = getCourseTitles(filter);
        }
        // Merge & deduplicate (static first, then localStorage extras)
        const codes = [...new Set([...staticCodes, ...localCodes])];
        const titles = [...new Set([...staticTitles, ...localTitles])];
        setCourseSuggestions({ codes, titles });
    }

    // Re-compute course & experiment suggestions when dept/roll/section/group changes
    useEffect(() => {
        refreshCourseSuggestions();
        // Only show experiment suggestions when filter is complete
        if (data.courseCode && isFilterComplete()) {
            setExperimentSuggestions(getExperimentNos(data.courseCode, getCourseFilter()));
        } else {
            setExperimentSuggestions([]);
        }
    }, [data.departmentName, data.studentRoll, data.section, selectedGroupId, groups]);

    function refreshStudentSuggestions() {
        const students = getSavedStudents();
        setStudentSuggestions({
            names: students.map((s) => s.name).filter(Boolean),
            rolls: students.map((s) => s.roll).filter(Boolean),
        });
    }

    const handleChange = (key) => (e) => {
        const val = typeof e === "string" ? e : e.target.value;
        const updated = { ...data, [key]: val };

        const filter = getCourseFilter();

        // Auto-fill title when code is selected
        if (key === "courseCode") {
            // Only use static data when all filter criteria match
            if (isFilterComplete()) {
                const staticMatch = findCourseByCode(val, filter);
                if (staticMatch) {
                    updated.courseTitle = staticMatch.courseTitle;
                }
            }
            // Fall back to localStorage memory if static didn't match
            if (!updated.courseTitle || updated.courseTitle === data.courseTitle) {
                const localMatch = getSavedCourses().find(
                    (c) => c.code.toLowerCase() === val.toLowerCase()
                );
                if (localMatch && localMatch.title) updated.courseTitle = localMatch.title;
            }

            // Update experiment number suggestions (only from static when filter is complete)
            if (isFilterComplete()) {
                setExperimentSuggestions(getExperimentNos(val, filter));
            } else {
                setExperimentSuggestions([]);
            }
            // Reset experiment fields when course changes
            updated.experimentNo = "";
            updated.experimentName = "";

            // Auto-fill teacher from teacher-course pairing
            const pairing = findTeacherForCourseAll(val);
            if (pairing) {
                updated.teacherName = pairing.teacherName;
                const teacher = findTeacher(pairing.teacherName);
                if (teacher) {
                    updated.designation = teacher.designation;
                    updated.teacherDepartment = teacher.department;
                }
            }
        }
        if (key === "courseTitle") {
            if (isFilterComplete()) {
                const staticMatch = findCourseByTitle(val, filter);
                if (staticMatch) {
                    updated.courseCode = staticMatch.courseCode;
                    setExperimentSuggestions(getExperimentNos(staticMatch.courseCode, filter));
                    updated.experimentNo = "";
                    updated.experimentName = "";
                }
            }
            // Fall back to localStorage memory
            if (!updated.courseCode || updated.courseCode === data.courseCode) {
                const localMatch = getSavedCourses().find(
                    (c) => c.title.toLowerCase() === val.toLowerCase()
                );
                if (localMatch && localMatch.code) updated.courseCode = localMatch.code;
            }
        }

        // Auto-fill experiment name when experiment number is selected
        if (key === "experimentNo") {
            if (isFilterComplete()) {
                const expName = findExperimentName(data.courseCode, val, filter);
                if (expName) updated.experimentName = expName;
            }
            // Format experiment no as 2 digits for storage
            if (val) updated.experimentNo = padExpNo(val);
        }

        // Auto-fill roll when name is selected from memory (and vice-versa)
        if (key === "studentName") {
            const match = getSavedStudents().find(
                (s) => s.name && s.name.toLowerCase() === val.toLowerCase()
            );
            if (match && match.roll) {
                updated.studentRoll = match.roll;
                const sec = sectionFromRoll(match.roll);
                if (sec) updated.section = sec;
            }
        }
        if (key === "studentRoll") {
            const match = getSavedStudents().find(
                (s) => s.roll && s.roll.toLowerCase() === val.toLowerCase()
            );
            if (match && match.name) updated.studentName = match.name;
            // Auto-fill section from roll
            const sec = sectionFromRoll(val);
            if (sec) updated.section = sec;
        }

        // Auto-fill designation + department when teacher is selected
        if (key === "teacherName") {
            const teacher = findTeacher(val);
            if (teacher) {
                updated.designation = teacher.designation;
                updated.teacherDepartment = teacher.department;
            }
        }

        onChange(updated);
    };

    // --- Blur handlers save pairings using the ref (always fresh data) ---
    const handleStudentBlur = () => {
        const d = dataRef.current;
        if (d.studentName && d.studentRoll) {
            saveStudent(d.studentName, d.studentRoll);
            refreshStudentSuggestions();
        }
    };

    const handleCourseBlur = () => {
        const d = dataRef.current;
        if (d.courseCode && d.courseTitle) {
            saveCourse(d.courseCode, d.courseTitle);
            refreshCourseSuggestions();
        }
    };

    const handleTeacherBlur = () => {
        const d = dataRef.current;
        if (d.courseCode && d.teacherName) {
            saveTeacherCourseLocal(d.courseCode, d.teacherName);
            if (user) {
                saveTeacherCourse(user.uid, d.courseCode, d.teacherName).catch(() => { });
            }
        }
    };

    // Helper to find teacher for a course code (checks Firestore pairings first, then localStorage)
    function findTeacherForCourseAll(courseCode) {
        if (!courseCode) return null;
        const lower = courseCode.toLowerCase();
        // Check Firestore pairings first (logged-in user)
        if (firestoreTeacherCourses.length > 0) {
            const match = firestoreTeacherCourses.find(
                (p) => p.courseCode && p.courseCode.toLowerCase() === lower
            );
            if (match) return match;
        }
        // Fall back to localStorage
        return findTeacherForCourse(courseCode);
    }

    const handlePrint = () => {
        // Save to history if logged in
        if (user) {
            addHistory(user.uid, { ...data }).catch(() => { });
        }
        window.print();
    };

    const handleDownloadSeparate = async () => {
        const selectedGroup = groups.find((g) => g.id === selectedGroupId);
        const members = selectedGroup?.members || [];
        if (members.length === 0) return;

        setDownloading(true);
        const originalData = { ...data };

        for (const member of members) {
            const memberData = {
                ...data,
                studentName: member.name,
                studentRoll: member.roll,
                section: member.section || data.section,
            };
            onChange(memberData);
            await new Promise((r) => setTimeout(r, 300));
            await downloadOnePDF(memberData);
        }

        onChange(originalData);

        // Save one group history entry
        if (user) {
            addHistory(user.uid, {
                ...data,
                isGroup: true,
                groupId: selectedGroupId,
                groupName: selectedGroup.name,
                memberCount: members.length,
            }).catch(() => { });
        }
        setDownloading(false);
    };

    const handleDownloadMerged = async () => {
        const selectedGroup = groups.find((g) => g.id === selectedGroupId);
        const members = selectedGroup?.members || [];
        if (members.length === 0) return;

        setDownloading(true);
        const originalData = { ...data };

        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const memberData = {
                ...data,
                studentName: member.name,
                studentRoll: member.roll,
                section: member.section || data.section,
            };
            onChange(memberData);
            await new Promise((r) => setTimeout(r, 300));

            const element = document.querySelector(".a4-page");
            if (!element) continue;
            const docWidth = document.documentElement.scrollWidth;
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                windowWidth: docWidth,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector(".a4-page");
                    if (el) el.style.boxShadow = "none";
                },
            });
            if (i > 0) pdf.addPage();
            pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, 210, 297);
        }

        onChange(originalData);

        const code = data.courseCode || "CODE";
        const expNo = data.experimentNo || "00";
        pdf.save(`${code}_${selectedGroup.name}_${expNo}.pdf`);

        // Save one group history entry
        if (user) {
            addHistory(user.uid, {
                ...data,
                isGroup: true,
                groupId: selectedGroupId,
                groupName: selectedGroup.name,
                memberCount: members.length,
            }).catch(() => { });
        }
        setDownloading(false);
    };

    const handleDownloadSingle = async () => {
        await downloadOnePDF(data);
        if (user) {
            addHistory(user.uid, { ...data }).catch(() => { });
        }
    };

    const downloadOnePDF = async (pdfData) => {
        const element = document.querySelector(".a4-page");
        if (!element) return;

        const code = pdfData.courseCode || "CODE";
        const roll = pdfData.studentRoll || "ROLL";
        const expNo = pdfData.experimentNo || "00";
        const filename = `${code}_${roll}_${expNo}.pdf`;

        // Use the full document scrollWidth so html2canvas doesn't
        // create a narrower virtual viewport that reflows text.
        const docWidth = document.documentElement.scrollWidth;

        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            windowWidth: docWidth,
            onclone: (clonedDoc) => {
                const el = clonedDoc.querySelector(".a4-page");
                if (el) {
                    el.style.boxShadow = "none";
                }
            },
        });

        // Create a single-page A4 PDF and stretch the image to fill it exactly
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = 210;
        const pageHeight = 297;

        pdf.addImage(
            canvas.toDataURL("image/jpeg", 0.98),
            "JPEG",
            0,
            0,
            pageWidth,
            pageHeight
        );

        pdf.save(filename);
    };

    const isAssignment = data.reportType === "Assignment";
    const inputClass =
        "input-modern";

    return (
        <div className="no-print w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 space-y-4">
            <h2 className="font-space text-xl font-bold text-gray-800 text-center mb-2">
                Cover Page Details
            </h2>

            {/* Group selection (only if logged in and has groups) */}
            {user && groups.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                        Generate for Group (optional)
                    </label>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className={inputClass + " cursor-pointer"}
                    >
                        <option value="">Individual (single student)</option>
                        {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name} ({g.members?.length || 0} members)
                            </option>
                        ))}
                    </select>
                    {selectedGroupId && (
                        <p className="text-xs text-blue-600 mt-1">
                            Cover pages will be generated for all group members.
                        </p>
                    )}
                </div>
            )}

            {/* Department Name — autocomplete + dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                </label>
                <AutocompleteInput
                    value={data.departmentName}
                    onChange={(val) => handleChange("departmentName")(val)}
                    suggestions={DEPARTMENTS}
                    placeholder="Electrical & Electronic Engineering (EEE)"
                    className={inputClass}
                />
            </div>

            {/* Cover Type — dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Type
                </label>
                <select
                    value={data.reportType}
                    onChange={(e) => handleChange("reportType")(e)}
                    className={inputClass + " cursor-pointer"}
                >
                    <option value="">Select cover type</option>
                    {COVER_TYPES.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            {/* Student Name, Roll, Section — above course fields (only in individual mode) */}
            {!isGroupMode && (
                <>
                    <div onBlur={handleStudentBlur}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student Name
                        </label>
                        <AutocompleteInput
                            value={data.studentName}
                            onChange={(val) => handleChange("studentName")(val)}
                            suggestions={studentSuggestions.names}
                            placeholder="Md. Example"
                            className={inputClass}
                        />
                    </div>
                    <div onBlur={handleStudentBlur}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student Roll
                        </label>
                        <AutocompleteInput
                            value={data.studentRoll}
                            onChange={(val) => handleChange("studentRoll")(val)}
                            suggestions={studentSuggestions.rolls}
                            placeholder="2103001"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section
                        </label>
                        <input
                            type="text"
                            value={data.section}
                            onChange={handleChange("section")}
                            placeholder="A"
                            className={inputClass}
                        />
                    </div>
                </>
            )}

            {/* Course Code — autocomplete from static + memory */}
            <div onBlur={handleCourseBlur}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code
                </label>
                <AutocompleteInput
                    value={data.courseCode}
                    onChange={(val) => handleChange("courseCode")(val)}
                    suggestions={courseSuggestions.codes}
                    placeholder="EEE 1102"
                    className={inputClass}
                />
            </div>

            {/* Course Title — autocomplete from static + memory */}
            <div onBlur={handleCourseBlur}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                </label>
                <AutocompleteInput
                    value={data.courseTitle}
                    onChange={(val) => handleChange("courseTitle")(val)}
                    suggestions={courseSuggestions.titles}
                    placeholder="Electrical Circuits I Lab"
                    className={inputClass}
                />
            </div>

            {/* Experiment/Assignment No */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isAssignment ? "Assignment No" : "Experiment No"}
                </label>
                <AutocompleteInput
                    value={data.experimentNo}
                    onChange={(val) => handleChange("experimentNo")(val)}
                    suggestions={experimentSuggestions}
                    placeholder="01"
                    className={inputClass}
                />
            </div>

            {/* Experiment/Assignment Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isAssignment ? "Assignment Name" : "Experiment Name"}
                </label>
                <input
                    type="text"
                    value={data.experimentName}
                    onChange={handleChange("experimentName")}
                    placeholder={
                        isAssignment
                            ? "Leave empty to hide from cover"
                            : "Verification of KVL and KCL"
                    }
                    className={inputClass}
                />
            </div>

            {/* Remaining simple fields */}
            {[
                { key: "teacherName", label: "Teacher Name", placeholder: "Dr. Example", autocomplete: true, suggestions: getTeacherNames(), onBlur: handleTeacherBlur },
                {
                    key: "designation",
                    label: "Designation",
                    placeholder: "Professor, Dept. of EEE",
                },
                {
                    key: "dateOfExperiment",
                    label: "Date of Experiment",
                    placeholder: "01/01/2026",
                    type: "date",
                },
                {
                    key: "dateOfSubmission",
                    label: "Date of Submission",
                    placeholder: "08/01/2026",
                    type: "date",
                },
            ].map(({ key, label, placeholder, type, autocomplete, suggestions, onBlur }) => (
                <div key={key} onBlur={onBlur}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                    {autocomplete ? (
                        <AutocompleteInput
                            value={data[key]}
                            onChange={(val) => handleChange(key)(val)}
                            suggestions={suggestions}
                            placeholder={placeholder}
                            className={inputClass}
                        />
                    ) : (
                        <input
                            type={type || "text"}
                            value={data[key]}
                            onChange={handleChange(key)}
                            placeholder={placeholder}
                            className={inputClass}
                        />
                    )}
                </div>
            ))}

            <div className="flex flex-col gap-3 mt-2">
                {isGroupMode ? (
                    <>
                        <button
                            onClick={handleDownloadMerged}
                            disabled={downloading}
                            className="w-full btn-secondary py-2.5 disabled:opacity-50"
                        >
                            {downloading ? "Generating…" : `Download All in One PDF (${groups.find((g) => g.id === selectedGroupId)?.members?.length || 0} pages)`}
                        </button>
                        <button
                            onClick={handleDownloadSeparate}
                            disabled={downloading}
                            className="w-full btn-danger py-2.5 disabled:opacity-50"
                        >
                            {downloading ? "Generating…" : `Download as Separate PDFs (${groups.find((g) => g.id === selectedGroupId)?.members?.length || 0} files)`}
                        </button>
                    </>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex-1 btn-primary py-2.5"
                        >
                            Print
                        </button>
                        <button
                            onClick={handleDownloadSingle}
                            className="flex-1 btn-secondary py-2.5"
                        >
                            Download PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
