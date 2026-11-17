import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured 
} from "../services/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getUsers, saveUser } from "../services/dataStore";
import { INITIAL_USERS } from "../services/sampleData";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Current logged in user object
  // Default to Software Admin for immediate testing if in preview mode
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("lex_active_user");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USERS[0]; // Software Admin
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Monitor Firebase Auth state if configured
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const allUsers = await getUsers();
          let profile = allUsers.find(u => u.uid === firebaseUser.uid || u.email === firebaseUser.email);

          if (!profile) {
            // First time registration: Default role is staff (or software admin if first user)
            const isFirst = allUsers.length === 0;
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              role: isFirst ? "software_admin" : "staff",
              designation: "Legal Staff Associate",
              phone: firebaseUser.phoneNumber || "",
              isActive: true,
              createdAt: new Date().toISOString()
            };
            await saveUser(profile);
          }

          setCurrentUser(profile);
          localStorage.setItem("lex_active_user", JSON.stringify(profile));
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Update localStorage when currentUser changes
  const setUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("lex_active_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("lex_active_user");
    }
  };

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
      // Mock Google Login in preview mode
      const googleMock = {
        uid: "google-mock-" + Date.now(),
        email: "counsel.associate@lexveritaslaw.com",
        displayName: "Advocate (Google Sign-In)",
        role: "staff",
        designation: "Associate Advocate",
        isActive: true
      };
      await saveUser(googleMock);
      setUser(googleMock);
      return { success: true, user: googleMock };
    }
  };

  // Email & Password Login
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: cred.user };
      } catch (err) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    } else {
      // Check existing users in storage
      const users = await getUsers();
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        return { success: true, user: matched };
      } else {
        // Create demo session
        const newUser = {
          uid: "usr-" + Date.now(),
          email,
          displayName: email.split("@")[0],
          role: "staff",
          designation: "Legal Staff Associate",
          isActive: true
        };
        await saveUser(newUser);
        setUser(newUser);
        return { success: true, user: newUser };
      }
    }
  };

  // Register with Email & Password
  const registerWithEmail = async (email, password, displayName, requestedRole = "staff") => {
    setAuthError(null);
    if (isFirebaseConfigured() && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const newProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: displayName || email.split("@")[0],
          role: requestedRole,
          designation: requestedRole === "accounts_admin" ? "Accounts Officer" : "Legal Staff",
          isActive: true
        };
        await saveUser(newProfile);
        setUser(newProfile);
        return { success: true, user: newProfile };
      } catch (err) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    } else {
      const newProfile = {
        uid: "usr-" + Date.now(),
        email,
        displayName: displayName || email.split("@")[0],
        role: requestedRole,
        designation: requestedRole === "accounts_admin" ? "Accounts Officer" : "Legal Staff",
        isActive: true
      };
      await saveUser(newProfile);
      setUser(newProfile);
      return { success: true, user: newProfile };
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    if (isFirebaseConfigured() && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: "Password reset link sent to " + email };
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      return { 
        success: true, 
        message: `In live mode, a password reset link is securely dispatched by Firebase to ${email}. (Preview simulated successfully!)` 
      };
    }
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      await signOut(auth);
    }
    setUser(null);
  };

  // Quick Switcher for Demo / Inspection
  const switchDemoRole = async (targetRole) => {
    const users = await getUsers();
    const match = users.find(u => u.role === targetRole) || {
      uid: "user-" + targetRole,
      email: `${targetRole}@lexveritaslaw.com`,
      displayName: targetRole.replace("_", " ").toUpperCase(),
      role: targetRole,
      isActive: true
    };
    setUser(match);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        setUser,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        switchDemoRole,
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
