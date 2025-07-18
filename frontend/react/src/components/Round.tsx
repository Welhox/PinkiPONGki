import React from "react";
import MatchCard from "./MatchCard";
import { Match } from "../types/game";
import { useTranslation } from "react-i18next";

interface RoundProps {
  round: number;
  matches: Match[];
  onLaunch: (match: Match) => void;
}

const Round: React.FC<RoundProps> = ({ round, matches, onLaunch }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-2">
        {t("round.roundTitle", { round })}
      </h2>
      <div className="flex flex-row gap-8">
        {matches.map((match, i) => (
          <MatchCard key={match.id || i} match={match} onLaunch={onLaunch} />
        ))}
      </div>
    </div>
  );
};

export default Round;
