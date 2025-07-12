import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import DeleteAccountButton from "../components/DeleteAccount";
import EditProfilePic from "../components/EditProfilePic";
import SettingsField from "../components/SettingsField";
import LanguageSelector from "../components/LanguageSelector";
import ToggleSwitch from "../components/ToggleSwitch";
import api from "../api/axios";
import ConfirmOtpField from "../components/ConfirmOtpField";
import { useTranslation } from "react-i18next";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { status, user, refreshSession } = useAuth();
  const { t, i18n } = useTranslation();

  // import current settings from backend
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);

  //this effect runs twice at the moment as it also triggers on email change
  // this is because the email state is updated after fetching user settings
  // the email state is needed for updating the is2FAEnabled state upon email change
  useEffect(() => {
    // Fetch user settings from the backend
    const fetchUserSettings = async () => {
      try {
        const response = await api.get("/users/settings", {});
        console.log("RESPONSE:", response.data);
        setEmail(response.data.email);
        setLanguage(response.data.language);
        setIs2FAEnabled(response.data.mfaInUse);
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };
    if (status === "authorized") {
      fetchUserSettings();
    }
  }, [status, email]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthorized") return <Navigate to="/" replace />;

  const handleReturn = () => {
    navigate("/");
  };

  const handleDelete = async (password: string) => {
    if (!user?.id) throw new Error("No user ID available");

    try {
      await api.post(`/users/delete/${user?.id}`, { password });
      localStorage.clear();
      sessionStorage.clear();
      await refreshSession();

      alert(t("settings.deleteAccountConfirm"));
      navigate("/");
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      alert(t("settings.deleteAccountError"));
    }
  };

  //toggle mfa on/off
  // send request to backend to update mfa status
  //is a a guard against spamming otps needed?
  const handle2FAToggle = async () => {
    try {
      // send request to backend to update 2FA status
      if (is2FAEnabled === true) {
        const response = await api.post("/auth/mfa", {
          mfaInUse: !is2FAEnabled,
        });
        setIs2FAEnabled(response.data.mfaInUse);
        console.log("2FA toggled!");
      } //check if email is already validated and show the Otp field to validate email if not
      else {
        const user = await api.get("/users/emailStatus", {});
        if (user.data.emailVerified === true) {
          const response = await api.post("/auth/mfa", {
            mfaInUse: !is2FAEnabled,
          });
          setIs2FAEnabled(response.data.mfaInUse);
          console.log("2FA toggled!");
        } else {
          // send otp to email
          try {
            const response = await api.get("/auth/otp-wait-time", {});
            const waitTime = response.data.secondsLeft;
            setShowOtpField(true);

            if (waitTime > 0) {
              alert(
                `Please wait ${waitTime} seconds before requesting a new OTP.`
              );
            } else {
              await api.post("/auth/otp/send-otp", {});
            }
          } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Please try again later.");
          }
        }
      }
    } catch (error) {
      console.error("Error updating 2FA status:", error);
    }
  };

  const uploadProfilePic = async (file: File | null) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post("/user/profile-pic", formData);

      await refreshSession();
      console.log(user);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert("Upload failed: " + (error.response?.data?.error || error.message));
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    try {
      const response = await api.post("/user/language", { language: newLang });

      setLanguage(response.data.language);
      i18n.changeLanguage(response.data.language);
      console.log("Language updated to:", response.data.language);
    } catch (error: any) {
      console.error("Failed to update language:", error);
      alert(t("settings.languageError"));
    }
  };

  return (
    <div className="p-5 mt-5 text-center max-w-2xl dark:bg-black bg-white mx-auto rounded-lg text-center dark:text-white">
      <h1 className="text-6xl text-center text-teal-800 dark:text-teal-300 m-3">
        {t("settings.title")}
      </h1>
      <EditProfilePic
        pic={
          user?.profilePic
            ? `${user.profilePic}`
            : `/assets/default_avatar.png`
        }
        onChange={() => {}}
        onSave={uploadProfilePic}
      />
      <SettingsField
        label={t("settings.email")}
        type="email"
        value={email}
        onUpdate={(newEmail) => setEmail(newEmail)}
      />
      <SettingsField
        label={t("settings.password")}
        type="password"
        value="********"
      />
      <LanguageSelector value={language} onChange={handleLanguageChange} />
      <ToggleSwitch
        label={t("settings.twoFactorAuth")}
        enabled={is2FAEnabled}
        onToggle={handle2FAToggle}
      />
      {showOtpField && (
        <ConfirmOtpField
          setIs2FAEnabled={setIs2FAEnabled}
          setShowOtpField={setShowOtpField}
          otp={otp}
          setOtp={setOtp}
        />
      )}
      <DeleteAccountButton onDelete={handleDelete} />
      <button
        className="font-semibold block mx-auto my-5 px-20 text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 
								  focus:outline-none focus:ring-blue-300 rounded-lg text-sm w-full 
								  sm:w-auto py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700
								  dark:focus:ring-teal-800"
        onClick={handleReturn}
      >
        {t("settings.back")}
      </button>
    </div>
  );
};

export default Settings;
