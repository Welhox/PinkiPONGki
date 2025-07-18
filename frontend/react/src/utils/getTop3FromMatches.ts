import { Match, Player } from "../types/game";

/**
 * Calculates the top 3 players (1st, 2nd, 3rd) from a completed tournament.
 * @param finalRoundMatches - The final round matches (should include final).
 * @param allMatches - All matches played in the tournament.
 * @returns An array: [1st, 2nd, 3rd]
 */
export function getTop3FromMatches(
  allMatches: Match[],
): Player[] {
  if (allMatches.length === 0) return [];

  // Find the highest round (final match)
  const maxRound = Math.max(...allMatches.map((m) => m.round));
  const finalMatch = allMatches.find((m) => m.round === maxRound);

  if (!finalMatch || !finalMatch.winnerId) return [];

  const firstPlace =
    finalMatch.winnerId === finalMatch.player1.id
      ? finalMatch.player1
      : finalMatch.player2;

  const secondPlace =
    finalMatch.winnerId === finalMatch.player1.id
      ? finalMatch.player2
      : finalMatch.player1;

  // Semi-final matches are one round before the final
  const semiFinalMatches = allMatches.filter(
    (m) => m.round === maxRound - 1 && m.winnerId !== null
  );

  // Get the two losers from semifinals
  const semiFinalLosers = semiFinalMatches.map((match) => {
    return match.winnerId === match.player1.id ? match.player2 : match.player1;
  });

  const thirdPlace = semiFinalLosers[0] || null;

  return [firstPlace, secondPlace, thirdPlace].filter(Boolean);
}
