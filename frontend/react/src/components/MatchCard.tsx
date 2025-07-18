import React from "react";
import { Match, Player } from "../types/game";
import { useTranslation } from "react-i18next";

interface MatchCardProps {
  match: Match;
  onPlay: (match: Match, winner: Player) => void;
}


const MatchCard: React.FC<MatchCardProps> = ({ match, onPlay }) => {
  const { player1, player2, status, winnerId, winnerAlias } = match;
  const { t } = useTranslation();

  // compute what to show when the match is done
  const winnerDisplay = (() => {
    if (winnerId !== null) {
      // registered user won
      if (winnerId === player1.id) return player1.name;
      if (winnerId === player2.id) return player2.name;
      // defensive: some other ID?
      return t("matchcard.unknownPlayer");
    }
    // guest won
    return winnerAlias ?? t("matchcard.unknownPlayer");
  })();

  return (
    <div className="flex justify-between items-center p-3 border rounded mb-2">
      <div>
        <span className="font-semibold">{player1?.name ?? "TBD"}</span> vs{" "}
        <span className="font-semibold">{player2?.name ?? "TBD"}</span>
      </div>
      {status === "completed" || status === "archived" ? (
        <div className="text-green-600 font-semibold">
          {t("matchcard.winner")}: {winnerDisplay}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => onPlay(match, player1)}
          >
            {t("matchcard.win", { name: player1.name })}
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => onPlay(match, player2)}
          >
            {t("matchcard.win", { name: player2.name })}
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
