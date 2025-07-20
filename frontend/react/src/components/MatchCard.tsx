import React from "react";
import { Match } from "../types/game";
import { useTranslation } from "react-i18next";

interface MatchCardProps {
  match: Match;
  onLaunch: (match: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onLaunch }) => {
  const { player1, player2, status, winnerId, winnerAlias } = match;
  const { t } = useTranslation();

  // compute winner display exactly as before
  const winnerDisplay = (() => {
    if (winnerId !== null) {
      if (winnerId === player1.id) return player1.name;
      if (winnerId === player2.id) return player2.name;
      return t("matchcard.unknownPlayer");
    }
    return winnerAlias ?? t("matchcard.unknownPlayer");
  })();

  return (
    <div className="p-3 border rounded mb-2">
      {status === "pending" ? (
        <>
          <div className="mb-2 text-center">
            <span className="font-semibold">{player1.name}</span> vs{" "}
            <span className="font-semibold">{player2.name}</span>
          </div>
          <button
            className="w-full py-2 bg-blue-600 text-white text-lg font-semibold rounded hover:bg-blue-700"
            onClick={() => onLaunch(match)}
          >
            {t("matchcard.play")}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-1">
            <span className="font-semibold">{player1.name}</span> vs{" "}
            <span className="font-semibold">{player2.name}</span>
          </div>
          <div className="text-green-600 font-bold text-2xl">
            {t("matchcard.winner")}: {winnerDisplay}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;

