import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useAuth } from "../contexts/AuthContext";
import { getGroups } from "../services/firestoreService";
import { addHistory } from "../services/firestoreService";
import { getTeacherCourses, saveTeacherCourse } from "../services/firestoreService";
import { getTeacherNames, findTeacher } from "../data/teachers";

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
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId || "");
    const [downloading, setDownloading] = useState(false);
    const [firestoreTeacherCourses, setFirestoreTeacherCourses] = useState([]);

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

    function refreshCourseSuggestions() {
        const courses = getSavedCourses();
        setCourseSuggestions({
            codes: courses.map((c) => c.code).filter(Boolean),
            titles: courses.map((c) => c.title).filter(Boolean),
        });
    }

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

        // Auto-fill title when code is selected from memory (and vice-versa)
        if (key === "courseCode") {
            const match = getSavedCourses().find(
                (c) => c.code.toLowerCase() === val.toLowerCase()
            );
            if (match && match.title) updated.courseTitle = match.title;

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
            const match = getSavedCourses().find(
                (c) => c.title.toLowerCase() === val.toLowerCase()
            );
            if (match && match.code) updated.courseCode = match.code;
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

    // Save course pair when either field loses focus
    const handleCourseBlur = () => {
        if (data.courseCode || data.courseTitle) {
            saveCourse(data.courseCode, data.courseTitle);
            refreshCourseSuggestions();
        }
    };

    // Save teacher-course pairing when teacher or course fields lose focus
    const handleTeacherBlur = () => {
        if (data.courseCode && data.teacherName) {
            saveTeacherCourseLocal(data.courseCode, data.teacherName);
            if (user) {
                saveTeacherCourse(user.uid, data.courseCode, data.teacherName).catch(() => { });
            }
        }
    };

    // Save student pair when either field loses focus
    const handleStudentBlur = () => {
        if (data.studentName || data.studentRoll) {
            saveStudent(data.studentName, data.studentRoll);
            refreshStudentSuggestions();
        }
    };

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

            {/* Course Code — autocomplete from memory */}
            <div>
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
                <input type="hidden" onBlur={handleCourseBlur} />
            </div>

            {/* Course Title — autocomplete from memory */}
            <div>
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
                <input
                    type="text"
                    value={data.experimentNo}
                    onChange={handleChange("experimentNo")}
                    onBlur={handleCourseBlur}
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
                ...(!isGroupMode ? [
                    { key: "studentName", label: "Student Name", placeholder: "Md. Example", autocomplete: true, suggestions: studentSuggestions.names, onBlur: handleStudentBlur },
                    { key: "studentRoll", label: "Student Roll", placeholder: "2103001", autocomplete: true, suggestions: studentSuggestions.rolls, onBlur: handleStudentBlur },
                    { key: "section", label: "Section", placeholder: "A" },
                ] : []),
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
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                    {autocomplete ? (
                        <div onBlur={onBlur}>
                            <AutocompleteInput
                                value={data[key]}
                                onChange={(val) => handleChange(key)(val)}
                                suggestions={suggestions}
                                placeholder={placeholder}
                                className={inputClass}
                            />
                        </div>
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
