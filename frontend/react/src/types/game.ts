export interface Player {
  id: number;
  name: string;
}

export interface Match {
  id?: number;
  player1: Player;
  player2: Player;
  result: "win" | "loss" | null;
  winnerId: number | null;
  round: number;
  saved: boolean;
}
