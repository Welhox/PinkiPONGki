import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { AuthContextType } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import ChoosePlayMode from "../components/ChoosePlayMode";

interface HomeProps {
  status: AuthContextType["status"];
  user: AuthContextType["user"];
}

const Home: React.FC<HomeProps> = ({ status, user }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [inMenu, setInMenu] = useState(true);
  const locationKeyRef = useRef(location.key);

  useEffect(() => {
    if (status !== "authorized") {
      i18n.changeLanguage("en");
    }
  }, [status, user]);

  useEffect(() => {
    // Reset to menu mode every time we navigate to "/"
    if (location.pathname === "/" && location.key !== locationKeyRef.current) {
      console.log("Navigated to / with a new location.key — resetting inMenu");
      setInMenu(true);
    }
    locationKeyRef.current = location.key;
  }, [location.key, location.pathname]);

  return (
    <div className="text-center max-w-2xl dark:bg-black bg-white mx-auto rounded-lg my-5 flex flex-col justify-center items-center min-h-[400px] px-4 py-6">
      {inMenu && (
        <>
          {status === "loading" ? (
            <p>{t("home.checkingSession")}</p>
          ) : status === "authorized" && user ? (
            <>
                <h1 className="text-6xl text-center text-teal-800 dark:text-teal-300 m-3">
                    {t("home.welcome")}
                </h1>
                <p className="dark:text-white pb-10">
                ✨{" "}{t("home.hello")}, {user.username}{" "}✨
                </p>
            </>
          ) : (
            <>
              <section className="max-w-3xl mx-auto text-center pt-8 px-6">
                <h1 className="text-4xl font-bold mb-4 text-teal-900 dark:text-teal-300">
                  {t("pongIntro.title")}
                </h1>
                <p className="text-lg mb-6 text-gray-800 dark:text-gray-200">{t("pongIntro.paragraph1")}</p>
                <p className="text-lg mb-6 text-gray-800 dark:text-gray-200">{t("pongIntro.paragraph2")}</p>
                <p className="text-xl font-semibold text-red-900 dark:text-red-500">
                  {t("pongIntro.conclusion")}
                </p>
              </section>
              <p className="dark:text-white text-center font-bold p-5">
                🏓 {t("home.noAccount")}{" "}
                <Link
                  className="text-amber-900 dark:text-amber-300 font:bold hover:font-extrabold"
                  to="/register"
                >
                  {t("home.register")} 🏓
                </Link>
              </p>
            </>
          )}
        </>
      )}
      <ChoosePlayMode
        onInteract={() => {
          console.log("User interacted — hiding welcome");
          setInMenu(false);
        }}
        onReturnToMenu={() => {
          console.log("User returned to menu — showing welcome");
          setInMenu(true);
        }}
      />
    </div>
  );
};

export default Home;
