import React from "react";
import Round from "./Round";
import { Match, Player } from "../types/game";

interface BracketProps {
  matches: Match[];
  onPlay: (match: Match, winner: Player) => void;
}

const Bracket: React.FC<BracketProps> = ({ matches, onPlay }) => {
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
        // filter played matches
        const activeMatches = roundMatches.filter(
          (m) => m.status !== "completed" && m.status !== "archived"
        );
        console.log("Active matches:", activeMatches);
        if (activeMatches.length === 0) return null;
        return (
          <div
            key={roundNumber}
            className="flex flex-col items-center"
            style={{ marginBottom: `${round * 30}px` }}
          >
            <Round
              key={roundNumber}
              round={Number(roundNumber)}
              matches={activeMatches}
              onPlay={onPlay}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Bracket;
