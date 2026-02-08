import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CoverPage from "../components/CoverPage";
import InputForm from "../components/InputForm";
import { useAuth } from "../contexts/AuthContext";

const DEFAULT_DATA = {
    departmentName: "",
    reportType: "",
    courseCode: "",
    courseTitle: "",
    experimentNo: "",
    experimentName: "",
    studentName: "",
    studentRoll: "",
    section: "",
    teacherName: "",
    designation: "",
    teacherDepartment: "",
    dateOfExperiment: "",
    dateOfSubmission: "",
};

const FORM_STORAGE_KEY = "ruet_cover_form_data";

function getSavedFormData() {
    try {
        return JSON.parse(localStorage.getItem(FORM_STORAGE_KEY)) || null;
    } catch {
        return null;
    }
}

function saveFormData(data) {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
}

export default function CoverPageGenerator() {
    const { user, profile } = useAuth();
    const [searchParams] = useSearchParams();
    const [data, setData] = useState(DEFAULT_DATA);
    const [showForm, setShowForm] = useState(true);
    const [scale, setScale] = useState(1);

    const A4_WIDTH_PX = 210 * 3.7795275591; // ~793.7px
    const initialGroupId = searchParams.get("groupId") || "";

    // Auto-fill: localStorage first, then profile overlay, then URL params overlay
    useEffect(() => {
        const saved = getSavedFormData();
        let initial = saved ? { ...DEFAULT_DATA, ...saved } : { ...DEFAULT_DATA };

        // Fill from profile (only fields that are still empty, or always override dept)
        if (profile) {
            const profileFields = ["studentName", "studentRoll", "section", "designation"];
            profileFields.forEach((f) => {
                if (profile[f] && !initial[f]) initial[f] = profile[f];
            });
            // Always keep department from profile if available
            if (profile.departmentName) initial.departmentName = profile.departmentName;
        }

        // Override with URL search params (from history re-open)
        const hasUrlParams = [...searchParams.entries()].some(([key]) => key in DEFAULT_DATA);
        if (hasUrlParams) {
            for (const [key, value] of searchParams.entries()) {
                if (key in initial) initial[key] = value;
            }
        }

        setData(initial);
    }, [profile, searchParams]);

    // Persist form data to localStorage on every change
    useEffect(() => {
        // Only save if at least one field is non-empty
        const hasData = Object.values(data).some((v) => v);
        if (hasData) saveFormData(data);
    }, [data]);

    useEffect(() => {
        const calcScale = () => {
            const availableWidth = window.innerWidth - 32; // 16px padding each side
            setScale(Math.min(availableWidth / A4_WIDTH_PX, 1));
        };
        calcScale();
        window.addEventListener("resize", calcScale);
        return () => window.removeEventListener("resize", calcScale);
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-100 via-blue-50/30 to-gray-100">
            {/* Desktop layout */}
            <div className="hidden lg:flex py-10 items-start justify-center gap-10 px-4">
                <div className="no-print lg:sticky lg:top-26">
                    <InputForm data={data} onChange={setData} initialGroupId={initialGroupId} />
                </div>
                <div className="overflow-auto">
                    <CoverPage data={data} />
                </div>
            </div>

            {/* Mobile layout */}
            <div className="lg:hidden">
                {/* Toggle switch */}
                <div className="no-print sticky top-16 z-40 bg-gray-100 px-4 py-3 flex items-center justify-center gap-3 border-b border-gray-200">
                    <span className={`text-sm font-medium ${showForm ? "text-blue-600" : "text-gray-400"}`}>
                        Edit Fields
                    </span>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${showForm ? "bg-blue-600" : "bg-gray-300"}`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showForm ? "" : "translate-x-6"}`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${!showForm ? "text-blue-600" : "text-gray-400"}`}>
                        Preview
                    </span>
                </div>

                {/* Conditional content */}
                <div className="px-4 py-6">
                    {showForm ? (
                        <InputForm data={data} onChange={setData} initialGroupId={initialGroupId} />
                    ) : (
                        <div
                            className="overflow-hidden"
                            style={{
                                width: `${A4_WIDTH_PX * scale}px`,
                                height: `${297 * 3.7795275591 * scale}px`,
                            }}
                        >
                            <div
                                style={{
                                    width: `${A4_WIDTH_PX}px`,
                                    transform: `scale(${scale})`,
                                    transformOrigin: "top left",
                                }}
                            >
                                <CoverPage data={data} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
