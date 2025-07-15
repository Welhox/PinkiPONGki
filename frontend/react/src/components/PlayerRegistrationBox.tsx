import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthProvider";
import { isAxiosError } from "axios";
import i18n from "../i18n";

interface PlayerBoxProps {
  label: string;
  onRegister: (player: { username: string; isGuest: boolean }) => void;
  playerId: number;
}

const PlayerRegistrationBox: React.FC<PlayerBoxProps> = ({
  label,
  onRegister,
  playerId,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const { user, refreshSession } = useAuth();
  const [confirmMFA, setConfirmMFA] = useState(false);

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
    if (!username) {
      setError(t("playerBox.usernameRequired"));
      return;
    }
    if (user && username === user.username && password) {
      setError("You're already logged in with this username.");
      return;
    }
    if (!password) {
      // Guest registration: allow any alias, no backend check
      onRegister({ username, isGuest: true });
    } else {
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
            setConfirmMFA(true);
            return;
          }
          await refreshSession();
        } else {
          console.log("Implement custom tournament login API here");
          let player2Response;
          player2Response = await api.post("/users/player-2-login", {
            username,
            password,
          });
          if (player2Response.data.mfaRequired) {
            setConfirmMFA(true);
            return;
          }
        }
        onRegister({ username, isGuest: false });
      } catch {
        setError(t("playerBox.loginFailed"));
      }
    }
  };

  if (confirmMFA === true) {
    return (
      <form
        onSubmit={handleMfaSubmit}
        className="flex flex-col items-center w-full bg-white dark:bg-black dark:text-teal-200"
      >
        <label className="mb-2 font-bold">{t("mfa.heading")}</label>
        <input
          className="mb-2 p-2 border rounded w-48"
          type="password"
          placeholder={t("mfa.otpLabel")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="bg-teal-700 text-white px-4 py-2 rounded"
          type="submit"
        >
          {t("playerBox.continue")}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    );
  } else {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full bg-white dark:bg-black dark:text-teal-200"
      >
        <label className="mb-2 font-bold">{label}</label>
        <input
          className="mb-2 p-2 border rounded w-48"
          placeholder={t("playerBox.usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="mb-2 p-2 border rounded w-48"
          type="password"
          placeholder={t("playerBox.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-teal-700 text-white px-4 py-2 rounded"
          type="submit"
        >
          {t("playerBox.continue")}
        </button>
        <span className="text-xs mt-1 text-gray-500">
          {t("playerBox.guestHint")}
        </span>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    );
  }
};

export default PlayerRegistrationBox;
