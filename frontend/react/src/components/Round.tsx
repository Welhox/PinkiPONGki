import React from "react";
import MatchCard from "./MatchCard";
import { Match } from "../types/game";
import { useTranslation } from "react-i18next";

interface RoundProps {
  round: number;
  matches: Match[];
  onLaunch: (match: Match) => void;
  locked?: boolean;
}

const Round: React.FC<RoundProps> = ({ round, matches, onLaunch, locked }) => {
  const { t } = useTranslation();

  const batchSize = 2;
  const matchDisabledFlags: boolean[] = [];

  for (let i = 0; i < matches.length; i += batchSize) {
    const batch = matches.slice(i, i + batchSize);

    const isUnlocked =
      i === 0 ||
      matches
        .slice(i - batchSize, i)
        .every((m) => m.status === "completed" || m.status === "archived");

    for (let j = 0; j < batch.length; j++) {
      const match = batch[j];
      const isPending = match.status === "pending";

      // Final disabling condition:
      const disabled = locked || !isUnlocked || !isPending;

      matchDisabledFlags.push(disabled);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-2">
        {t("round.roundTitle", { round })}
      </h2>
      <div className="flex flex-row gap-8">
        {matches.map((match, i) => (
          <MatchCard
            key={match.id || i}
            match={match}
            onLaunch={onLaunch}
            disabled={matchDisabledFlags[i]}
          />
        ))}
      </div>
    </div>
  );
};

export default Round;
