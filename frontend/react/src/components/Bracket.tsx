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

  const sortedRounds = Object.entries(rounds).sort(
    ([a], [b]) => Number(b) - Number(a)
  );

  return (
    <div className="flex flex-col items-center gap-12">
      {sortedRounds.map(([roundNumber, roundMatches]) => {
        const round = Number(roundNumber);

        return (
          <div
            key={roundNumber}
            className="flex flex-col items-center"
            style={{ marginBottom: `${round * 30}px` }}
          >
            <Round
              key={roundNumber}
              round={Number(roundNumber)}
              matches={roundMatches}
              onLaunch={onLaunch}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Bracket;
