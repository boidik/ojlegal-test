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

export const AuthProvider = ({ children }) => {
  // Current user starts as null! Strict authentication required.
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Monitor real Firebase Auth state
  useEffect(() => {
    // Clear any obsolete mock session
    localStorage.removeItem("lex_active_user");
    localStorage.removeItem("oj_active_user");

    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch real user profile from Firestore
            const userRef = doc(db, "users", firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              setCurrentUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: userData.displayName || firebaseUser.displayName || firebaseUser.email.split("@")[0],
                role: userData.role || "staff",
                designation: userData.designation || "Legal Associate",
                phone: userData.phone || firebaseUser.phoneNumber || "",
                isActive: userData.isActive !== false,
              });
            } else {
              // First time user registration in Firestore
              // If there are zero existing users in Firestore, assign software_admin to the creator.
              // All subsequent users default to staff.
              let role = "staff";
              try {
                const allUsersSnap = await getDocs(collection(db, "users"));
                if (allUsersSnap.empty) {
                  role = "software_admin";
                }
              } catch (e) {
                console.warn("Could not check users count:", e);
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
            console.error("Error loading user profile from Firestore:", err);
            // Fallback basic user object
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              role: "staff",
            });
          }
        } else {
          // No user is logged in
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Not configured, still starts as null
      setCurrentUser(null);
      setLoading(false);
    }
  }, []);

  // Google Sign-In
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
      } catch (err) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    } else {
      return { success: false, error: "Firebase Authentication is not configured." };
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
        let msg = err.message;
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          msg = "Invalid email or password. Please verify your credentials.";
        }
        setAuthError(msg);
        return { success: false, error: msg };
      }
    } else {
      return { success: false, error: "Firebase Authentication is not configured." };
    }
  };

  // Register with Email & Password
  const registerWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Determine role: if first user in Firestore, make software_admin, otherwise staff
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
        let msg = err.message;
        if (err.code === "auth/email-already-in-use") {
          msg = "This email is already registered. Please sign in instead.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password should be at least 6 characters long.";
        }
        setAuthError(msg);
        return { success: false, error: msg };
      }
    } else {
      return { success: false, error: "Firebase Authentication is not configured." };
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    if (isFirebaseConfigured() && auth) {
      try {
        await sendPasswordResetEmail(auth, email.trim());
        return { success: true, message: "Password reset link sent to " + email };
      } catch (err) {
        return { success: false, error: err.message };
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
