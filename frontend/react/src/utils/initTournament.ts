import api from "../api/axios";
import { Match, Player } from "../types/game";

export const formatPlayers = (participants: any[]): Player[] =>
  participants.map((p: any) => ({
    id: p.tournamentUserId,
    name: p.user?.username || p.alias,
  }));

export const formatMatches = (matches: any[]): Match[] =>
  matches.map((m: any) => {
    const p1: Player = {
      id: m.player1Id,
      name: m.player1?.username || m.player1Alias,
    };

    const p2: Player = {
      id: m.player2Id,
      name: m.player2?.username || m.player2Alias,
    };

    let result: "win" | "loss" | null = null;
    let winnerId: number | null = null;

    if (m.status === "played") {
      if (m.winnerId === p1.id) {
        result = "win";
        winnerId = p1.id;
      } else if (m.winnerId === p2.id) {
        result = "loss";
        winnerId = p2.id;
      } else {
        result = null;
      }
    }

    return {
      id: m.id,
      player1: p1,
      player2: p2,
      result,
      winnerId,
      round: m.round,
      saved: true,
    };
  });

export const fetchTournamentWithMatches = async (id: number) => {
  const res = await api.get(`/tournaments/${id}`);
  return res.data;
};

export const startTournamentIfWaiting = async (id: number) => {
  await api.post(`/tournaments/${id}/start`);
  const res = await api.get(`/tournaments/${id}`);
  return res.data;
};
