import { Match, Player } from "../types/game";

/**
 * Calculates the top 3 players (1st, 2nd, 3rd) from a completed tournament.
 * @param finalRoundMatches - The final round matches (should include final).
 * @param allMatches - All matches played in the tournament.
 * @returns An array: [1st, 2nd, 3rd]
 */
export function getTop3FromMatches(
  finalRoundMatches: Match[],
  allMatches: Match[]
): Player[] {
  if (finalRoundMatches.length !== 1) return [];

  const finalMatch = finalRoundMatches[0];

  const firstPlace =
    finalMatch.winnerId === finalMatch.player1.id
      ? finalMatch.player1
      : finalMatch.player2;

  const secondPlace =
    finalMatch.winnerId === finalMatch.player1.id
      ? finalMatch.player2
      : finalMatch.player1;

  // get semifinal matches
  const semiFinalMatches = allMatches.filter(
    (m) => m.round === finalMatch.round - 1
  );

  // identify semifinal losers who lost to either finalist
  const semiFinalLosers = semiFinalMatches
    .map((m) => {
      const winner = m.winnerId === m.player1.id ? m.player1 : m.player2;
      const loser = m.winnerId === m.player1.id ? m.player2 : m.player1;
      return { winner, loser };
    })
    .filter(
      (res) =>
        res.winner.id === firstPlace.id || res.winner.id === secondPlace.id
    )
    .map((res) => res.loser);

  const thirdPlace = semiFinalLosers[0] || null;
  return [firstPlace, secondPlace, thirdPlace];
}
