import { Match, Player } from "../types/game";

/**
 * Calculates the top 3 players (1st, 2nd, 3rd) from a completed tournament.
 */
export function getTop3FromMatches(allMatches: Match[]): Player[] {
  if (allMatches.length === 0) return [];

  // helper to get the actual winner as a Player object,
  // falling back to alias if winnerId is null
  const getWinnerPlayer = (m: Match): Player | null => {
    // registered user winner
    if (m.winnerId !== null) {
      return m.winnerId === m.player1.id ? m.player1 : m.player2;
    }
    // guest winner (alias must be present!)
    if (m.winnerAlias) {
      // match alias to whichever side
      return m.winnerAlias === m.player1.name ? m.player1 : m.player2;
    }
    return null;
  };

  // --- Final match (highest round) ---
  const maxRound   = Math.max(...allMatches.map((m) => m.round));
  const finalMatch = allMatches.find((m) => m.round === maxRound);

  // if no final or no recorded winner/alias, bail
  if (!finalMatch || !getWinnerPlayer(finalMatch)) {
    return [];
  }

  const winnerPlayer = getWinnerPlayer(finalMatch)!;
  const loserPlayer  =
    winnerPlayer === finalMatch.player1 ? finalMatch.player2 : finalMatch.player1;

  // --- Semi‑finals (one round before final) ---
  const semiFinalMatches = allMatches.filter(
    (m) => m.round === maxRound - 1 && getWinnerPlayer(m) !== null
  );

  // losers = the non‑winner side in each semi
  const semiFinalLosers = semiFinalMatches.map((m) => {
    const winner = getWinnerPlayer(m)!;
    return winner === m.player1 ? m.player2 : m.player1;
  });

  // pick the first loser as 3rd place (you could add logic for a 3rd‑place match)
  const thirdPlace = semiFinalLosers[0] ?? null;

  // return only the non‑null players
  return [winnerPlayer, loserPlayer, thirdPlace].filter(
    (p): p is Player => p !== null
  );
}


