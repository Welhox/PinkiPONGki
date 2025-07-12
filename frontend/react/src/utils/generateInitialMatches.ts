import { Match, Player } from "../types/game";

export const generateInitialMatches = (players: Player[]): Match[] => {
	const matches: Match[] = [];
	for (let i = 0; i < players.length; i += 2) {
		const p1 = players[i];
		const p2 = players[i + 1];
		if (p2) {
			matches.push({
				player1: p1,
				player2: p2,
				result: null,
				winnerId: null,
				round: 1,
				saved: false,
			});
		}
	}
	return matches;
};