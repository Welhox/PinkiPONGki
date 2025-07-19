import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import PongGameWithRegistration from "./PongGameWithRegistration";
import PongGameAI from "./PongGameAI";
import TournamentBuilder from "./TournamentBuilder";
import GameCustomization from "./GameCustomization";
import { useTranslation } from "react-i18next";

interface ChoosePlayModeProps {
  onInteract?: () => void; // optional so it's reusable
  onReturnToMenu?: () => void;
}

const ChoosePlayMode: React.FC<ChoosePlayModeProps> = ({
  onInteract,
  onReturnToMenu,
}) => {
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const location = useLocation();
  const initialRenderRef = useRef(true);
  const prevKeyRef = useRef(location.key);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const [headerWidth, setHeaderWidth] = useState<number | null>(null);

  // Handle home button click detection and game state reset
  useEffect(() => {
    // Skip the effect on the initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }

    // Only process if location.key has changed (actual navigation event)
    // and we're on the home page, and a game mode is selected
    if (
      prevKeyRef.current !== location.key &&
      location.pathname === "/" &&
      selectedMode !== null
    ) {
      console.log("HOME button navigation detected - resetting game state");
      setSelectedMode(null);
    }

    // Always update the previous key reference
    prevKeyRef.current = location.key;
  }, [location.key, location.pathname, selectedMode]);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderWidth(headerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    if (selectedMode) {
      console.log("selectedMode: ", selectedMode);
    }
  }, [selectedMode]);
  const buttonStyles =
    "px-5 mx-3 py-5 my-2 text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm w-full sm:w-auto py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800";

  const handleSinglePlayer = () => {
    console.log("Selected Single Player mode");
    setSelectedMode("single-player-customize");
    onInteract?.();
  };

  const handleTwoPlayer = () => {
    console.log("Selected Two Player mode");
    setSelectedMode("two-player-customize");
    onInteract?.();
  };

  const handleCreateTournament = () => {
    console.log("Selected Tournament mode");
    setSelectedMode("tournament-customize");
    onInteract?.();
  };

  // Added logging to debug transitions
  useEffect(() => {
    console.log(`Mode changed to: ${selectedMode}`);
  }, [selectedMode]);

  if (selectedMode === "two-player-single-game") {
    console.log("Rendering PongGameWithRegistration");
    return (
      <PongGameWithRegistration
        onReturnToMenu={() => {
          console.log("ChoosePlayMode: Return to menu callback triggered");
          setSelectedMode(null);
        }}
      />
    );
  } else if (selectedMode === "single-player") {
    console.log("Rendering PongGameAI");
    return (
      <PongGameAI
        onReturnToMenu={() => {
          console.log("ChoosePlayMode: Return to menu callback triggered");
          setSelectedMode(null);
        }}
      />
    );
  } else if (selectedMode === "single-player-customize") {
    return (
      <GameCustomization
        isAIGame={true} // This is an AI game, show difficulty settings
        onStartGame={() => {
          console.log("Starting single player game");
          setSelectedMode("single-player");
        }}
        onBack={() => setSelectedMode(null)}
      />
    );
  } else if (selectedMode === "two-player-customize") {
    return (
      <GameCustomization
        isAIGame={false} // This is a player vs player game, hide difficulty settings
        onStartGame={() => {
          console.log("Starting two player game");
          setSelectedMode("two-player-single-game");
        }}
        onBack={() => setSelectedMode(null)}
      />
    );
  } else if (selectedMode === "tournament-customize") {
    return (
      <GameCustomization
        isAIGame={false} // This is a tournament, hide difficulty settings
        onStartGame={() => {
          console.log("Starting tournament creation");
          setSelectedMode("create-tournament");
        }}
        onBack={() => setSelectedMode(null)}
      />
    );
  } else if (selectedMode === "create-tournament") {
    console.log("Rendering TournamentBuilder");
    return <TournamentBuilder />;
  }
  return (
    <div>
      <div>
        <h1
          ref={headerRef}
          className="text-6xl text-center text-teal-800 dark:text-teal-300 m-3"
        >
          {t("CPM.choosePlayMode")}
        </h1>

        {headerWidth && (
          <div
            className="mx-auto mt-6 flex justify-between"
            style={{ width: headerWidth }}
          >
            <button
              className={`${buttonStyles} flex-1 text-xl mx-2`}
              onClick={handleSinglePlayer}
            >
              {t("CPM.singlevsAI")}
            </button>
            <button
              className={`${buttonStyles} flex-1 text-xl mx-2`}
              onClick={handleTwoPlayer}
            >
              {t("CPM.twoplayersingle")}
            </button>
            <button
              className={`${buttonStyles} flex-1 text-xl mx-2`}
              onClick={handleCreateTournament}
            >
              {t("CPM.createTournament")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChoosePlayMode;
