/**
 * Static course & experiment data for RUET departments.
 * Each entry is tagged with department, series and section for filtering.
 * Series = first 2 digits of roll (e.g. "22" for 2201059).
 */

const COURSES_DATA = [
  {
    courseCode: "EEE 3100",
    courseTitle: "Electronics Shop Practice",
    department: "EEE",
    series: "22",
    section: "A",
    experiments: [
      {
        no: "1",
        name: "Introduction to PCB design, soldering and desoldering",
      },
      {
        no: "2",
        name: "Design, Soldering and Testing of an Astable Multivibrator Circuit Using a 555 Timer",
      },
      {
        no: "3",
        name: "Design, Soldering and Testing of a Cell Phone Charger Circuit.",
      },
      { no: "4", name: "Introduction to Arduino Microcontroller" },
      { no: "5", name: "Hands-On Projects with Arduino Microcontroller" },
      {
        no: "6",
        name: "Implementation of Bluetooth and Voice-Controlled Home Automation System using HC-05 and Arduino.",
      },
      {
        no: "7",
        name: "Control and Analyze the Operation of DC Motors Using Arduino and L293D Motor Driver IC",
      },
      {
        no: "8",
        name: "Design and Implementation of an Autonomous IR-Guided Line Follower Robot Using Arduino for Intelligent Line Tracking Applications",
      },
      {
        no: "9",
        name: "Smart Line Following and Obstacle Avoidance Robot with Directional Feedback and Movement Tracking.",
      },
    ],
  },
  {
    courseCode: "EEE 3106",
    courseTitle: "Control System Engineering Sessional",
    department: "EEE",
    series: "22",
    section: "A",
    experiments: [
      {
        no: "1",
        name: "Introduction to Simulink and Modeling of a Physical System (RC circuit/Mass-spring System)",
      },
      {
        no: "2",
        name: "Analyze and design the parameters of the separately excited DC generator using MATLAB Simulink.",
      },
      {
        no: "3",
        name: "Analyze and design the optimum parameters of an electromechanical system in state-space form using MATLAB Simulink.",
      },
      {
        no: "4",
        name: "Analyze and design the optimum parameters of the motor-generator set for the desired speed using MATLAB Simulink",
      },
      {
        no: "5",
        name: "Enhancement of the stability of a System using Conventional (PI, PD, and PID) Controllers: 01. Speed control of a DC motor 02. Load Frequency Control of a Single-area power system",
      },
      {
        no: "6",
        name: "Transient and steady state response analysis of a dynamic system using MATLAB/Simulink",
      },
      {
        no: "7",
        name: "Analysis of the Dynamics of a Physical System Using Root Locus Method Using MATLAB Tools and Also Identify the Stability",
      },
      {
        no: "8",
        name: "Frequency response analysis of dynamic systems using the Bode plot to confirm the stability",
      },
    ],
  },
  {
    courseCode: "EEE 3108",
    courseTitle: "Electrical Machines II Sessional",
    department: "EEE",
    series: "22",
    section: "A",
    experiments: [
      {
        no: "1",
        name: "Introduction to different DC & AC machines and general discussion on safety and precautions.",
      },
      {
        no: "2",
        name: "Observation of characteristics of synchronous generator (VT vs IF & VT vs f).",
      },
      {
        no: "3",
        name: "Determination of synchronous reactance of a 3-phase synchronous generator.",
      },
      {
        no: "4",
        name: "Observation of external characteristics curve of a synchronous generator on different types of loads.",
      },
      {
        no: "5",
        name: "Synchronization of a 3ϕ alternator with an infinite bus using lamp method.",
      },
      { no: "6", name: "Determination of V-curve of a synchronous motor." },
      {
        no: "7",
        name: "Observation of load characteristic of a synchronous motor.",
      },
      {
        no: "8",
        name: "Starting an induction motor by using star-delta starter method.",
      },
      {
        no: "9",
        name: "Observation of speed torque characteristic curve of 3-phase induction motor.",
      },
      {
        no: "10",
        name: "Determination of equivalent circuit parameters using blocked rotor test & no-load test of 3-phase induction motor.",
      },
      {
        no: "11",
        name: "Starting and observation of different characteristics of a single-phase induction motor.",
      },
      {
        no: "12",
        name: "Determination of equivalent circuit parameters using blocked rotor test & no-load test of single-phase induction motor.",
      },
    ],
  },
  {
    courseCode: "EEE 3110",
    courseTitle: "Computational Methods in Engineering Sessional",
    department: "EEE",
    series: "22",
    section: "A",
    experiments: [
      {
        no: "1",
        name: "Introduction to MATLAB and performing algebraic and matrix manipulations using MATLAB",
      },
      {
        no: "2",
        name: "Solving non-linear equations using Bisection Method in MATLAB",
      },
      {
        no: "3",
        name: "Solving Non-linear equations using the false position method",
      },
      {
        no: "4",
        name: "Solving non-linear equations using Newton Raphson Method and Secant Method",
      },
      {
        no: "5",
        name: "Solving System of linear equation using Gauss elimination method",
      },
      {
        no: "6",
        name: "Solving system of linear equations using Jacobi and Gauss-Seidel Method",
      },
      {
        no: "7",
        name: "Solving system of linear equations and matrix inversion using LU Decomposition Method",
      },
      {
        no: "8",
        name: "Finding intermediate points using Lagrange Interpolating Polynomial",
      },
      { no: "9", name: "Non-linear polynomial curve fitting using MATLAB" },
      {
        no: "10",
        name: "Solving ordinary differential equations using various numerical methods (Euler's Method, Heun's Method, Modified Euler's/Runge Kutta 2nd Order Method, Runge Kutta 4th Order Method)",
      },
      {
        no: "11",
        name: "Open-ended lab: The student has to model any electrical system (e.g., different combinations of RLC circuit, motor control system) involving an ODE, solve the ODE using several numerical methods, such as Euler's method and Runge-Kutta methods, and compare their accuracy.",
      },
    ],
  },
  {
    courseCode: "EEE 3118",
    courseTitle: "Communication Engineering I Sessional",
    department: "EEE",
    series: "22",
    section: "A",
    experiments: [
      {
        no: "1",
        name: "Observation and Verification of Amplitude Modulation (AM) and demodulation Technique",
      },
      {
        no: "2",
        name: "Observation and Verification of Frequency modulation (FM) and demodulation technique",
      },
      {
        no: "3",
        name: "Fault Analysis of Integrated AM-FM Radio Training System",
      },
      {
        no: "4",
        name: "Observation and Verification of AM and FM Signal Transmission and Reception.",
      },
      {
        no: "5",
        name: "Fault Analysis of Color TV (CRT+ LCD/LED) Training System",
      },
      {
        no: "6",
        name: "Observation and Verification of Digital Telephone Switching System",
      },
    ],
  },
];

export default COURSES_DATA;

/**
 * Extract department abbreviation from full department name.
 * e.g. "Electrical & Electronic Engineering (EEE)" → "EEE"
 */
export function deptAbbr(fullName) {
  if (!fullName) return "";
  const m = fullName.match(/\(([^)]+)\)/);
  return m ? m[1] : "";
}

/**
 * Extract series from a roll number (first 2 digits).
 * e.g. "2201059" → "22"
 */
export function seriesFromRoll(roll) {
  if (!roll || roll.length < 2) return "";
  return roll.slice(0, 2);
}

/**
 * Filter courses matching the given department abbreviation, series, and section.
 * Returns all courses if no filters are provided.
 */
function filterCourses({ department, series, section } = {}) {
  return COURSES_DATA.filter((c) => {
    if (department && c.department !== department) return false;
    if (series && c.series !== series) return false;
    if (section && c.section.toUpperCase() !== section.toUpperCase())
      return false;
    return true;
  });
}

/**
 * Get course codes matching the filter criteria.
 */
export function getCourseCodes(filter) {
  return filterCourses(filter).map((c) => c.courseCode);
}

/**
 * Get course titles matching the filter criteria.
 */
export function getCourseTitles(filter) {
  return filterCourses(filter).map((c) => c.courseTitle);
}

/**
 * Find a course by code (case-insensitive). Optionally filter by dept/series/section.
 */
export function findCourseByCode(code, filter) {
  if (!code) return undefined;
  const lower = code.toLowerCase().replace(/\s+/g, "");
  const pool = filter ? filterCourses(filter) : COURSES_DATA;
  return pool.find(
    (c) => c.courseCode.toLowerCase().replace(/\s+/g, "") === lower,
  );
}

/**
 * Find a course by title (case-insensitive). Optionally filter by dept/series/section.
 */
export function findCourseByTitle(title, filter) {
  if (!title) return undefined;
  const lower = title.toLowerCase();
  const pool = filter ? filterCourses(filter) : COURSES_DATA;
  return pool.find((c) => c.courseTitle.toLowerCase() === lower);
}

/**
 * Get experiment numbers for a course code (for autocomplete/dropdown).
 */
export function getExperimentNos(courseCode, filter) {
  const course = findCourseByCode(courseCode, filter);
  if (!course) return [];
  return course.experiments.map((e) => e.no);
}

/**
 * Normalize an experiment number to its numeric string (strip leading zeros).
 * e.g. "01" → "1", "1" → "1", "10" → "10"
 */
export function normalizeExpNo(no) {
  if (!no) return "";
  return String(parseInt(no, 10));
}

/**
 * Pad an experiment number to 2 digits for display.
 * e.g. "1" → "01", "10" → "10"
 */
export function padExpNo(no) {
  if (!no) return "";
  const n = parseInt(no, 10);
  if (isNaN(n)) return no;
  return String(n).padStart(2, "0");
}

/**
 * Find experiment name by course code + experiment no.
 * Normalizes the experiment number so "01" and "1" match the same experiment.
 */
export function findExperimentName(courseCode, expNo, filter) {
  const course = findCourseByCode(courseCode, filter);
  if (!course || !expNo) return undefined;
  const normalized = normalizeExpNo(expNo);
  const exp = course.experiments.find(
    (e) => normalizeExpNo(e.no) === normalized,
  );
  return exp ? exp.name : undefined;
}
