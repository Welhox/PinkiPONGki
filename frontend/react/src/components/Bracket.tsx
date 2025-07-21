import React from "react";
import Round from "./Round";
import { Match } from "../types/game";

interface BracketProps {
  matches: Match[];
  onLaunch: (match: Match) => void;
}

const Bracket: React.FC<BracketProps> = ({ matches, onLaunch }) => {
  const rounds = matches.reduce<Record<number, Match[]>>((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {});

  // Sort rounds from highest to lowest
  const sortedRoundEntries = Object.entries(rounds).sort(
    ([a], [b]) => Number(b) - Number(a)
  );

  // Find the first round with pending matches
  const firstPlayableRound = Object.entries(rounds)
    .sort(([a], [b]) => Number(a) - Number(b)) // ascending
    .find(([_, matches]) =>
      matches.some((match) => match.status === "pending")
    )?.[0];

  return (
    <div className="flex flex-col items-center gap-12">
      {sortedRoundEntries.map(([roundNumber, roundMatches]) => {
        const round = Number(roundNumber);
        const isLocked =
          firstPlayableRound === undefined ||
          round !== Number(firstPlayableRound);

        return (
          <div
            key={roundNumber}
            className="flex flex-col items-center"
            style={{ marginBottom: `${Number(roundNumber) * 30}px` }}
          >
            <Round
              round={Number(roundNumber)}
              matches={roundMatches}
              onLaunch={onLaunch}
              locked={isLocked}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Bracket;
