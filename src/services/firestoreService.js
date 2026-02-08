import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/* ───────────── Profile ───────────── */

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

/* ───────────── Groups ───────────── */

function groupsCol(uid) {
  return collection(db, "users", uid, "groups");
}

export async function getGroups(uid) {
  const q = query(groupsCol(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createGroup(uid, name, members = []) {
  const ref = await addDoc(groupsCol(uid), {
    name,
    members, // [{name, roll, section}]
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGroup(uid, groupId, data) {
  await updateDoc(doc(db, "users", uid, "groups", groupId), data);
}

export async function deleteGroup(uid, groupId) {
  await deleteDoc(doc(db, "users", uid, "groups", groupId));
}

/* ───────────── History ───────────── */

function historyCol(uid) {
  return collection(db, "users", uid, "history");
}

export async function getHistory(uid) {
  const q = query(historyCol(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addHistory(uid, entry) {
  const ref = await addDoc(historyCol(uid), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteHistory(uid, historyId) {
  await deleteDoc(doc(db, "users", uid, "history", historyId));
}

/* ───────────── Teacher-Course Pairings ───────────── */

function teacherCoursesCol(uid) {
  return collection(db, "users", uid, "teacherCourses");
}

/**
 * Get all teacher-course pairings for a logged-in user.
 * Returns array of { id, courseCode, teacherName }.
 */
export async function getTeacherCourses(uid) {
  const snap = await getDocs(teacherCoursesCol(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Save or update a teacher-course pairing.
 * Uses courseCode (lowercased) as the document ID for easy upsert.
 */
export async function saveTeacherCourse(uid, courseCode, teacherName) {
  if (!courseCode || !teacherName) return;
  const docId = courseCode.toLowerCase().replace(/\s+/g, "_");
  await setDoc(doc(db, "users", uid, "teacherCourses", docId), {
    courseCode,
    teacherName,
    updatedAt: serverTimestamp(),
  });
}

/* ───────────── Admin ───────────── */

/**
 * Get all users from the users collection.
 * Only call this from an admin-protected page.
 */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

/**
 * Get the number of cover-page history entries for a given user.
 */
export async function getUserHistoryCount(uid) {
  const snap = await getDocs(collection(db, "users", uid, "history"));
  return snap.size;
}
