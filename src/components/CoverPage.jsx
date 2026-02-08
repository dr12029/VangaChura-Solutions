export default function CoverPage({ data }) {
    const isAssignment = data.reportType === "Assignment";
    const noLabel = isAssignment ? "Assignment No" : "Experiment No";
    const nameLabel = isAssignment ? "Assignment Name" : "Experiment Name";
    const hideNameRow = isAssignment && !data.experimentName;

    return (
        <div
            className="a4-page bg-white text-black font-times relative mx-auto"
            style={{
                width: "210mm",
                height: "297mm",
                padding: "25.4mm",
                lineHeight: 2,
                fontFamily: '"Times New Roman", Times, serif',
                letterSpacing: "0.03em",
                wordSpacing: "0.05em",
                boxShadow: "0 0 10px rgba(0,0,0,0.15)",
            }}
        >
            {/* Full content wrapper */}
            <div className="flex flex-col items-center h-full">
                {/* ===== 1. Header & Branding ===== */}
                <div className="flex flex-col items-center">
                    {/* RUET Logo */}
                    <img
                        src="/RUET_logo.png"
                        alt="RUET Logo"
                        className=""
                        style={{ width: "160px", objectFit: "contain" }}
                    />

                    {/* Department */}
                    <p className="text-center" style={{ fontSize: "14pt" }}>
                        Department of {data.departmentName || "____________________"}
                    </p>

                    {/* University Name */}
                    <p className="text-center mt-0.5" style={{ fontSize: "16pt" }}>
                        Rajshahi University of Engineering &amp; Technology

                    </p>

                    {/* Report Type (LAB Report / Assignment) */}
                    <p
                        className="font-bold text-center underline mt-5"
                        style={{ fontSize: "14pt" }}
                    >
                        {data.reportType || "LAB REPORT"}
                    </p>
                </div>

                {/* ===== 2. Course & Experiment Details ===== */}
                <div className="w-full" style={{ fontSize: "12pt" }}>
                    <table style={{ width: "100%" }}>
                        <tbody>
                            <Row label="Course Code" value={data.courseCode} />
                            <Row label="Course Title" value={data.courseTitle} />
                        </tbody>
                    </table>

                    {/* One line gap between course info and experiment info */}
                    <div style={{ height: "12pt" }} />
                    <div style={{ height: "12pt" }} />

                    <table style={{ width: "100%" }}>
                        <tbody>
                            <Row label={noLabel} value={data.experimentNo ? String(parseInt(data.experimentNo, 10) || 0).padStart(2, "0") : data.experimentNo} />
                            {!hideNameRow && (
                                <Row label={nameLabel} value={data.experimentName} />
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ===== 3. Submission Grid (two columns with vertical line) ===== */}
                <div className="w-full mt-16" style={{ fontSize: "12pt" }}>
                    <div className="grid grid-cols-2">
                        {/* Submitted By */}
                        <div className="pr-4 overflow-hidden" style={{ borderRight: "1px solid black" }}>
                            <p className="font-bold mb-2">Submitted By:</p>
                            <table style={{ width: "100%", tableLayout: "fixed" }}>
                                <tbody>
                                    <MiniRow label="Name" value={data.studentName} />
                                    <MiniRow label="Roll" value={data.studentRoll} />
                                    <MiniRow label="Section" value={data.section} />
                                </tbody>
                            </table>
                        </div>

                        {/* Submitted To */}
                        <div className="pl-4 overflow-hidden">
                            <p className="font-bold mb-2">Submitted To:</p>
                            <table style={{ width: "100%", tableLayout: "fixed" }}>
                                <tbody>
                                    <MiniRow label="" value={data.teacherName} centered />
                                    <MiniRow label="" value={data.designation} centered />
                                    <MiniRow label="" value={`Dept. of ${data.teacherDepartment || "EEE"}, RUET`} centered />
                                    <MiniRow label="" value="Rajshahi University of Engineering & Technology" centered lineHeight={1.15} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Spacer to push dates to bottom */}
                <div className="flex-grow" />

                {/* ===== 4. Footer & Dates ===== */}
                <div className="w-full" style={{ fontSize: "12pt", lineHeight: 1.15 }}>
                    <table style={{ width: "100%" }}>
                        <tbody>
                            <Row label="Date of Experiment" value={data.dateOfExperiment} />
                            <Row label="Date of Submission" value={data.dateOfSubmission} />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* Fixed-width label column so colons stay aligned */
function Row({ label, value }) {
    return (
        <tr>
            <td
                className="pr-2 align-top whitespace-nowrap py-0.5"
                style={{ width: "160px" }}
            >
                {label}
            </td>
            <td className="align-top py-0.5 whitespace-nowrap" style={{ width: "12px" }}>
                :
            </td>
            <td className="pl-2 align-top py-0.5">{value || "\u00A0"}</td>
        </tr>
    );
}

/* Rows for submitted-to column (no label, just values) */
function MiniRow({ label, value, centered, lineHeight, fontSize }) {
    if (!label) {
        const style = {};
        if (lineHeight) style.lineHeight = lineHeight;
        if (fontSize) style.fontSize = fontSize;
        return (
            <tr>
                <td
                    className={`align-top py-0.5 ${centered ? "text-center" : ""}`}
                    colSpan={3}
                    style={Object.keys(style).length ? style : undefined}
                >
                    {value || "\u00A0"}
                </td>
            </tr>
        );
    }
    return (
        <tr>
            <td
                className="pr-2 align-top whitespace-nowrap py-0.5"
                style={{ width: "70px" }}
            >
                {label}
            </td>
            <td className="align-top py-0.5 whitespace-nowrap" style={{ width: "12px" }}>
                :
            </td>
            <td className="pl-2 align-top py-0.5">{value || "\u00A0"}</td>
        </tr>
    );
}
