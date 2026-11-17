import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured,
  db 
} from "../services/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";

const AuthContext = createContext();

const formatAuthError = (err) => {
  if (!err) return "An unknown error occurred.";
  if (err.code === "auth/configuration-not-found") {
    return "Firebase Authentication has not been enabled yet in your Firebase Console. Go to Firebase Console (https://console.firebase.google.com/) > Select 'ojlegal-test' > Click 'Authentication' in left menu > Click 'Get Started' > Enable 'Email/Password' and 'Google'.";
  }
  if (err.code === "auth/unauthorized-domain") {
    return "This domain (boidik.github.io) needs to be authorized for Google Sign-In. Go to Firebase Console > Authentication > Settings tab > Authorized Domains > Click 'Add domain' and enter 'boidik.github.io'.";
  }
  if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
    return "Invalid email or password. Please verify your credentials or click 'New Associate? Register'.";
  }
  if (err.code === "auth/email-already-in-use") {
    return "This email is already registered. Please sign in instead.";
  }
  if (err.code === "auth/weak-password") {
    return "Password must be at least 6 characters long.";
  }
  if (err.code === "auth/popup-closed-by-user") {
    return "Google sign-in popup was closed before completing.";
  }
  return err.message || "Authentication error.";
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    localStorage.removeItem("lex_active_user");
    localStorage.removeItem("oj_active_user");

    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            const isOwner = firebaseUser.email && (firebaseUser.email.toLowerCase().includes("boidik") || firebaseUser.email.toLowerCase().includes("admin@ojlegal"));

            if (userSnap.exists()) {
              const userData = userSnap.data();
              let assignedRole = userData.role || (isOwner ? "software_admin" : "staff");
              if (isOwner && userData.role !== "software_admin") {
                assignedRole = "software_admin";
                try {
                  await setDoc(userRef, { role: "software_admin" }, { merge: true });
                } catch (e) {}
              }

              setCurrentUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userData.displayName || firebaseUser.displayName || firebaseUser.email.split("@")[0],
                role: assignedRole,
                designation: userData.designation || (assignedRole === "software_admin" ? "Systems Administrator" : assignedRole === "accounts_admin" ? "Accounts Head / Boss" : "Legal Associate"),
                phone: userData.phone || firebaseUser.phoneNumber || "",
                isActive: userData.isActive !== false,
              });
            } else {
              let role = isOwner ? "software_admin" : "staff";
              if (!isOwner) {
                try {
                  const allUsersSnap = await getDocs(collection(db, "users"));
                  if (allUsersSnap.empty) {
                    role = "software_admin";
                  }
                } catch (e) {}
              }

              const newProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
                role: role,
                designation: role === "software_admin" ? "Systems Administrator" : "Legal Staff Associate",
                phone: firebaseUser.phoneNumber || "",
                isActive: true,
                createdAt: new Date().toISOString()
              };

              await setDoc(userRef, newProfile);
              setCurrentUser(newProfile);
            }
          } catch (err) {
            console.error("Error loading user profile:", err);
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              role: "staff",
            });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  const updateLocalRole = (newRole) => {
    setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
      } catch (err) {
        const formatted = formatAuthError(err);
        setAuthError(formatted);
        return { success: false, error: formatted };
      }
    } else {
      return { success: false, error: "Firebase Authentication is not initialized." };
    }
  };

  // Email & Password Login
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        return { success: true, user: cred.user };
      } catch (err) {
        const formatted = formatAuthError(err);
        setAuthError(formatted);
        return { success: false, error: formatted };
      }
    } else {
      return { success: false, error: "Firebase Authentication is not initialized." };
    }
  };

  // Register with Email & Password
  const registerWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        let role = "staff";
        try {
          const allUsersSnap = await getDocs(collection(db, "users"));
          if (allUsersSnap.empty || allUsersSnap.size <= 1) {
            role = "software_admin";
          }
        } catch (e) {}

        const newProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: displayName.trim() || email.split("@")[0],
          role: role,
          designation: role === "software_admin" ? "Systems Administrator" : "Legal Staff Associate",
          isActive: true,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", cred.user.uid), newProfile);
        setCurrentUser(newProfile);
        return { success: true, user: newProfile };
      } catch (err) {
        const formatted = formatAuthError(err);
        setAuthError(formatted);
        return { success: false, error: formatted };
      }
    } else {
      return { success: false, error: "Firebase Authentication is not initialized." };
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    if (isFirebaseConfigured() && auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
        return { success: true, message: "Password reset link sent to " + email };
      } catch (err) {
        const formatted = formatAuthError(err);
        return { success: false, error: formatted };
      }
    } else {
      return { success: false, error: "Firebase is not configured." };
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        updateLocalRole,
        isSoftwareAdmin: currentUser?.role === "software_admin",
        isAccountsAdmin: currentUser?.role === "accounts_admin",
        isStaff: currentUser?.role === "staff"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
