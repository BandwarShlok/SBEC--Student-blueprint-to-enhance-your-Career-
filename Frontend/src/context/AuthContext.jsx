import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { AuthContext } from "./AuthContextObject";

// =====================================================
// API URL
// =====================================================
// Priority:
// 1. VITE_API_URL from .env
// 2. Current device hostname + port 5000
//
// Example:
// Laptop:  http://localhost:5173
// Mobile:  http://10.127.115.80:5173
//
// Both will automatically use:
// http://<same-host>:5000
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;


// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {

  // ---------------------------------------------------
  // TOKEN
  // ---------------------------------------------------

  const [token, setToken] = useState(() =>
    localStorage.getItem("sbec_token")
  );


  // ---------------------------------------------------
  // USER
  // ---------------------------------------------------

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("sbec_user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);

    } catch (error) {

      console.error(
        "Saved user data error:",
        error
      );

      return null;
    }
  });


  // ---------------------------------------------------
  // LOADING
  // ---------------------------------------------------

  const [loading, setLoading] = useState(
    () =>
      Boolean(
        localStorage.getItem("sbec_token")
      )
  );


  // ===================================================
  // INITIAL SESSION CHECK
  // ===================================================
  //
  // IMPORTANT:
  // We do NOT call a state-changing function
  // directly from the effect.
  //
  // This avoids:
  //
  // react-hooks/set-state-in-effect
  //
  // ===================================================

  useEffect(() => {

    const storedToken =
      localStorage.getItem("sbec_token");

    // No token = user is not logged in.
    // loading is already false because the
    // initial state depends on the token.
    if (!storedToken) {
      return;
    }

    let cancelled = false;


    const verifySession = async () => {

      try {

        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${storedToken}`,

              "Content-Type":
                "application/json",
            },
          }
        );


        const data =
          await response.json();


        // ------------------------------------------------
        // INVALID / EXPIRED TOKEN
        // ------------------------------------------------

        if (!response.ok) {

          throw new Error(
            data.message ||
              "Session expired."
          );
        }


        // ------------------------------------------------
        // INVALID USER RESPONSE
        // ------------------------------------------------

        if (!data.user) {

          throw new Error(
            "Invalid user data received."
          );
        }


        // ------------------------------------------------
        // UPDATE USER
        // ------------------------------------------------

        if (!cancelled) {

          setUser(data.user);

          localStorage.setItem(
            "sbec_user",
            JSON.stringify(data.user)
          );
        }

      } catch (error) {

        console.error(
          "Authentication Error:",
          error.message
        );


        // ------------------------------------------------
        // CLEAR INVALID SESSION
        // ------------------------------------------------

        if (!cancelled) {

          localStorage.removeItem(
            "sbec_token"
          );

          localStorage.removeItem(
            "sbec_user"
          );

          setToken(null);
          setUser(null);
        }

      } finally {

        if (!cancelled) {

          setLoading(false);
        }
      }
    };


    verifySession();


    // ---------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------

    return () => {

      cancelled = true;

    };

  }, []);


  // ===================================================
  // LOGIN
  // ===================================================

  const login = (
    newToken,
    userData = null
  ) => {

    if (!newToken) {
      return false;
    }


    // Save token
    localStorage.setItem(
      "sbec_token",
      newToken
    );


    // Update React state
    setToken(newToken);


    // Save user
    if (userData) {

      localStorage.setItem(
        "sbec_user",
        JSON.stringify(userData)
      );

      setUser(userData);
    }


    // Login is complete
    setLoading(false);


    return true;
  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {

    // Remove authentication data
    localStorage.removeItem(
      "sbec_token"
    );

    localStorage.removeItem(
      "sbec_user"
    );


    // Clear React state
    setToken(null);
    setUser(null);
    setLoading(false);
  };


  // ===================================================
  // AUTHENTICATION STATUS
  // ===================================================

  const isAuthenticated =
    Boolean(
      token &&
      user
    );


  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated,

      login,
      logout,
    }),
    [
      token,
      user,
      loading,
      isAuthenticated,
    ]
  );


  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;