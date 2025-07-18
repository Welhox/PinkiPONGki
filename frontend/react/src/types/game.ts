export interface Player {
  id: number;
  name: string;
}

export interface Match {
  id?: number;
  player1: Player;
  player2: Player;
  winnerId: number | null;
  winnerAlias: string | null;
  round: number;
  tournamentId: number;
  status?: "pending" | "completed" | "archived";
}
