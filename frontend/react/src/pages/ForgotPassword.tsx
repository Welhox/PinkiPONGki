import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";

const apiUrl = import.meta.env.VITE_API_BASE_URL || "api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { status } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [liveMessage, setLiveMessage] = useState<string | null>(null); // for screen reader aria announcements
  useEffect(() => {
	if (error || submitted) {
	 setLiveMessage(null); // force remount
	 setTimeout(() => {
	   setLiveMessage(submitted ? t("forgotPassword.successMessage") : error);
	   setTimeout(() => {
		 liveRegionRef.current?.focus();
	   }, 10);
	 }, 100);
 }}, [error, submitted]);

  const labelStyles =
    "block mb-2 text-sm font-medium text-gray-900 dark:text-white";
  const inputStyles =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  const buttonStyles =
    "block mx-auto my-5 px-20 text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm w-full sm:w-auto py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800";
  const altButtonStyles =
    "text-white bg-amber-700 hover:bg-amber-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm w-full sm:w-auto px-11 py-3 mx-3 my-3 text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800";

  if (status === "loading") return <p>Loading...</p>;
  //if (status === 'unauthorized') return <Navigate to="/" replace />;

  const handleReturn = () => {
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await axios.post(
        `${apiUrl}/users/request-password-reset`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setSubmitted(true);
    } catch (error: any) {
      setError(
        error.response?.data?.message || t("forgotPassword.genericError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center max-w-md mx-auto bg-white dark:bg-black p-6 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold text-teal-800 dark:text-teal-300 mb-6">
        {t("forgotPassword.title")}
      </h1>
   {/* This next part is a secret div, visible only to screen readers, which ensures that the error
	  or success messages get announced using aria. */}
       {liveMessage && (
        <div
          ref={liveRegionRef}
          tabIndex={-1}
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        >
          {liveMessage}
        </div>)}
      {submitted ? (
        <>
          <p className="text-green-600 dark:text-green-400 mb-4">
            {t("forgotPassword.successMessage")}
          </p>
          <button onClick={handleReturn} className={buttonStyles}>
            {t("forgotPassword.returnButton")}
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={labelStyles}>
              {t("forgotPassword.emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyles}
			  aria-label="Enter your email address to reset your password"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={altButtonStyles}
          >
            {isLoading
              ? t("forgotPassword.submitting")
              : t("forgotPassword.submitButton")}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
