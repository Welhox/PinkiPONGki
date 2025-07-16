import { Match, Player } from "../types/game";
import api from "../api/axios";
import { getTop3FromMatches } from "./getTop3FromMatches";
import { formatMatches } from "./initTournament";

type MatchUpdateHandlers = {
  setMatchesFromBackend: React.Dispatch<React.SetStateAction<Match[]>>;
  setUpcomingMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setFinalStandings: React.Dispatch<React.SetStateAction<Player[]>>;
};

export const handleMatchPlayed = async (
  match: Match,
  winner: Player,
  handlers: MatchUpdateHandlers
): Promise<void> => {
  const { setMatchesFromBackend, setUpcomingMatches, setFinalStandings } =
    handlers;

  try {
    // update match result in backend
    await api.post(
      `/tournaments/${match.tournamentId}/match/${match.id}/update`,
      { winnerId: winner.id, winnerAlias: winner.name }
    );

    // re-fetch updated match list from backend
    const response = await api.get(`/tournaments/${match.tournamentId}`);
    const updatedMatches = response.data.matches;

    // format if needed
    const formattedMatches = formatMatches(updatedMatches);

    setMatchesFromBackend(formattedMatches);

    // check if tournament has ended
    const tournamentStatus = response.data.status;
    if (tournamentStatus === "finished") {
      const top3 = getTop3FromMatches([], formattedMatches);
      setFinalStandings(top3);
    } else {
      // clear upcoming manually to ensure no phantom matches
      setUpcomingMatches([]);
    }
  } catch (error) {
    console.error("Error updating match:", error);
  }
};
/* const result: "win" | "loss" =
    winner.id === match.player1.id ? "win" : "loss";

  const updatedMatch: Match = {
    ...match,
    result,
    winnerId: winner.id,
    saved: true,
    id: match.id ?? Math.random(), // temp ID
  };

  // make sure there are no dublicate versions of matches array
  const allMatches = [...matchesFromBackend, ...upcomingMatches];
  const updatedMatches = allMatches.map((m) =>
    m.id === updatedMatch.id ? updatedMatch : m
  );

  const updatedMatches = [
		...matchesFromBackend,
		...upcomingMatches.filter((m) => m !== match),
		updatedMatch,
	];

  // update both sources of truth
  if (match.saved) {
    setMatchesFromBackend((prev) =>
      prev.map((m) => (m.id === match.id ? updatedMatch : m))
    );
  } else {
    setMatchesFromBackend((prev) => [...prev, updatedMatch]);
    setUpcomingMatches((prev) => prev.filter((m) => m !== match));
  }

  // check if the current round is complete
  const currentRoundMatches = updatedMatches.filter(
    (m) => m.round === match.round
  );

  const allFinished = currentRoundMatches.every((m) => m.winnerId !== null);

  if (allFinished) {
    const winners: Player[] = currentRoundMatches.map((m) =>
      m.winnerId === m.player1.id ? m.player1 : m.player2
    );

    if (winners.length === 1) {
      // tournament over!
      const finalStandings = getTop3FromMatches(
        currentRoundMatches,
        updatedMatches
      );
      setFinalStandings(finalStandings);
      return;
    }

    const nextRoundMatches: Match[] = [];
    for (let i = 0; i < winners.length; i += 2) {
      const p1 = winners[i];
      const p2 = winners[i + 1];
      if (p2) {
        nextRoundMatches.push({
          player1: p1,
          player2: p2,
          result: null,
          winnerId: null,
          round: match.round + 1,
          saved: false,
        });
      }
    }
    // add next round matches to upcoming
    setUpcomingMatches((prev) => [...prev, ...nextRoundMatches]);
  }
}; */
