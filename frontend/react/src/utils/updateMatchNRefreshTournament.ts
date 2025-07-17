import { Match, Player } from "../types/game";
import api from "../api/axios";
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

    // format
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
