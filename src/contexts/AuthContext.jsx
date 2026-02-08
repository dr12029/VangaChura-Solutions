import { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const snap = await getDoc(doc(db, "users", firebaseUser.uid));
                setProfile(snap.exists() ? snap.data() : null);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    async function signup(email, password, displayName) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        const defaultProfile = {
            displayName,
            email,
            studentName: "",
            studentRoll: "",
            section: "",
            departmentName: "",
            designation: "",
            createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, "users", cred.user.uid), defaultProfile);
        setProfile(defaultProfile);
        return cred.user;
    }

    async function login(email, password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(db, "users", cred.user.uid));
        setProfile(snap.exists() ? snap.data() : null);
        return cred.user;
    }

    async function logout() {
        await signOut(auth);
        setUser(null);
        setProfile(null);
    }

    async function refreshProfile() {
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        setProfile(snap.exists() ? snap.data() : null);
    }

    const value = { user, profile, loading, signup, login, logout, refreshProfile };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
