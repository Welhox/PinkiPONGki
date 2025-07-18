import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthProvider";
import { isAxiosError } from "axios";
import i18n from "../i18n";

interface PlayerBoxProps {
  label: string;
  onRegister: (player: { username: string; isGuest: boolean; id?: string }) => void;
  playerId: number;
}

const PlayerRegistrationBox: React.FC<PlayerBoxProps> = ({
  label,
  onRegister,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const { user, refreshSession } = useAuth();
  const [confirmMFA, setConfirmMFA] = useState(false);
  const [confirmPlayer2MFA, setConfirmPlayer2MFA] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleMfaPlayer2Submit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Trying with code:", code, "Email", email);
      const response = await api.post(
        "/auth/verify-tournamentOtp",
        { code, email },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200) {
        console.log("MFA verification successful");
        await refreshSession();
        setConfirmPlayer2MFA(false);
        // Get the user ID from the response if available
        const userId = response.data?.id || response.data?.user?.id;
        onRegister({ 
          username, 
          isGuest: false,
          id: userId ? String(userId) : undefined
        });
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setError(t("mfa.invalidOtp"));
        } else if (error.response.status === 403) {
          setError(t("mfa.otpExpired"));
        } else {
          setError(t("mfa.invalidOtp"));
        }
      } else {
        setError(t("mfa.generalError"));
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(
        "/auth/verify-otp",
        { code },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200) {
        console.log("MFA verification successful");
        await refreshSession();
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setError(t("mfa.invalidOtp"));
        } else if (error.response.status === 403) {
          setError(t("mfa.otpExpired"));
        } else {
          setError(t("mfa.invalidOtp"));
        }
      } else {
        setError(t("mfa.generalError"));
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username and password length
    if (username.length < 3 || username.length > 30) {
      setError(t("playerBox.usernameLengthError"));
      return;
    }
    
    if (password.length < 2 || password.length > 30) {
      setError(t("playerBox.passwordLengthError"));
      return;
    }
    
    if (user && username === user.username && password) {
      setError("You're already logged in with this username.");
      return;
    }
    
    // Registered user login
    let response;
    try {
      if (!user) {
        response = await api.post(
          "/users/login",
          { username, password },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = response.data;
        const userLang = response.data.language ?? "en";

        // Change language immediately
        if (i18n.language !== userLang) {
          await i18n.changeLanguage(userLang);
          localStorage.setItem("language", userLang);
        }
        if (data.mfaRequired) {
          //setEmail(data.email);
          setConfirmMFA(true);
          return;
        }
        await refreshSession();
      } else {
        console.log("Calling player-2-login API for Player 2");
        let player2Response;
        player2Response = await api.post("/users/player-2-login", {
          username,
          password,
        });
        
        // Log the full response to debug
        console.log("Player 2 login response:", player2Response.data);
        
        if (player2Response.data.mfaRequired) {
          console.log("MFA required for Player 2");
          setEmail(player2Response.data.email);
          setConfirmPlayer2MFA(true);
          return;
        }
        
        // Get the user ID if available
        const userId = player2Response.data?.id || player2Response.data?.user?.id;
        console.log("Player 2 ID extracted:", userId);
        
        // If we don't have an ID, try to fetch it
        if (!userId) {
          console.log("No user ID found in response, attempting to fetch user data");
          try {
            // Use the session endpoint to get logged in user
            const userDataResponse = await api.get("/users/findByUsername/" + username);
            const fetchedId = userDataResponse.data?.id;
            console.log("Fetched user data:", userDataResponse.data);
            
            onRegister({ 
              username, 
              isGuest: false,
              id: fetchedId ? String(fetchedId) : undefined
            });
          } catch (error) {
            console.error("Error fetching user data:", error);
            onRegister({ 
              username, 
              isGuest: false,
              id: undefined
            });
          }
        } else {
          onRegister({ 
            username, 
            isGuest: false,
            id: String(userId)
          });
        }
        return;
      }
      
      // For regular login, the user object should be available after refreshSession
      // We need to refresh again to get the latest user info
      await refreshSession();
      const currentUser = await api.get("/session/user");
      const userId = currentUser.data?.id;
      onRegister({ 
        username, 
        isGuest: false,
        id: userId ? String(userId) : undefined
      });
    } catch (error) {
      console.error("Login error:", error);
      setError(t("playerBox.loginFailed"));
    }
  };

  if (confirmMFA === true) {
    return (
      <form
        onSubmit={handleMfaSubmit}
        className="flex flex-col items-center w-full bg-white dark:bg-black dark:text-teal-200"
      >
        <label className="mb-2 font-bold">Enter Verification Code</label>
        <input
          className="mb-2 p-2 border rounded w-48"
          type="password"
          placeholder="OTP Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="bg-teal-700 text-white px-4 py-2 rounded"
          type="submit"
        >
          Continue
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    );
  } else if (confirmPlayer2MFA === true) {
    return (
      <form
        onSubmit={handleMfaPlayer2Submit}
        className="flex flex-col items-center w-full bg-white dark:bg-black dark:text-teal-200"
      >
        <label className="mb-2 font-bold">Enter Verification Code</label>
        <input
          className="mb-2 p-2 border rounded w-48"
          type="password"
          placeholder="OTP Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="bg-teal-700 text-white px-4 py-2 rounded"
          type="submit"
        >
          Continue
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    );
  } else if (showLoginForm) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full bg-white dark:bg-black dark:text-teal-200"
      >
        <label className="mb-2 font-bold">{label}</label>
        <input
          className="mb-2 p-2 border rounded w-48"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 30))}
          minLength={3}
          maxLength={30}
          required
        />
        <input
          className="mb-2 p-2 border rounded w-48"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value.slice(0, 30))}
          minLength={2}
          maxLength={30}
          required
        />
        <div className="flex space-x-2">
          <button
            className="bg-teal-700 text-white px-4 py-2 rounded"
            type="submit"
          >
            Continue
          </button>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
            type="button"
            onClick={() => setShowLoginForm(false)}
          >
            Back
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    );
  } else {
    return (
      <div className="flex flex-col items-center w-full bg-white dark:bg-black dark:text-teal-200">
        <label className="mb-4 font-bold text-lg">{label}</label>
        <div className="flex flex-col space-y-3">
          <button
            className="bg-teal-700 text-white px-6 py-3 rounded shadow-md hover:bg-teal-600 transition-colors w-48"
            onClick={() => setShowLoginForm(true)}
          >
            Login
          </button>
          <button
            className="bg-orange-500 text-white px-6 py-3 rounded shadow-md hover:bg-orange-600 transition-colors w-48"
            onClick={() => {
              // Use a random number between 1 and 999 as guest ID
              const randomId = Math.floor(Math.random() * 999) + 1;
              const guestName = `guest${randomId}`;
              onRegister({ username: guestName, isGuest: true, id: undefined });
            }}
          >
            Guest
          </button>
        </div>
      </div>
    );
  }
};

export default PlayerRegistrationBox;
