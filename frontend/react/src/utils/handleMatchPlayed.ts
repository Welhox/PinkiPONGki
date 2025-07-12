import { Match, Player } from "../types/game";
import { getTop3FromMatches } from "./getTop3FromMatches";

type MatchUpdateHandlers = {
	setMatchesFromBackend: React.Dispatch<React.SetStateAction<Match[]>>;
	setUpcomingMatches: React.Dispatch<React.SetStateAction<Match[]>>;
	setFinalStandings: React.Dispatch<React.SetStateAction<Player[]>>;
}

export const handleMatchPlayed = async (
	match: Match,
	winner: Player,
	matchesFromBackend: Match[],
	upcomingMatches: Match[],
	handlers: MatchUpdateHandlers
): Promise<void> => {
	const { setMatchesFromBackend, setUpcomingMatches, setFinalStandings } = handlers;

	const result: "win" | "loss" =
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
    const updatedMatches = allMatches.map((m) => m.id === updatedMatch.id ? updatedMatch : m);

	/* const updatedMatches = [
		...matchesFromBackend,
		...upcomingMatches.filter((m) => m !== match),
		updatedMatch,
	]; */

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
};

/* const handleMatchPlayed = async (
    match: Match,
    winner: Player
  ): Promise<void> => {
    const result: "win" | "loss" =
      winner.id === match.player1.id ? "win" : "loss";

    if (match.saved && match.id) {
      //await api.patch(`/match/${match.id}`, { result });
      console.log("Missing API for saving a match result");
      setMatchesFromBackend((prev) =>
        prev.map((m) =>
          m.id === match.id ? { ...m, result, winnerId: winner.id } : m
        )
      );
    } else {
      /* await api.post(`/tournament/${tournamentId}/matches`, {
        tournamentId,
        playerId: match.player1.id,
        opponentId: match.player2.id,
        round: match.round,
        result,
      });
      console.log("Missing API call for saving tournament match data");

      const savedMatch: Match = {
        ...match,
        result,
        winnerId: winner.id,
        saved: true,
        id: Math.random(), // temp for re-render
      };

      setMatchesFromBackend((prev) => [...prev, savedMatch]);
      setUpcomingMatches((prev) => prev.filter((m) => m !== match));
    }

    const currentRound = match.round;
    const roundMatches = [...matchesFromBackend, ...upcomingMatches].filter(
      (m) => m.round === currentRound
    );

    const allFinished = roundMatches.every((m) => m.result);
    if (allFinished) {
      const winners: Player[] = roundMatches.map((m) =>
        m.result === "win" ? m.player1 : m.player2
      );
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
            round: currentRound + 1,
            saved: false,
          });
        }
      }
      setUpcomingMatches((prev) => [...prev, ...nextRoundMatches]);
    }
  }; */