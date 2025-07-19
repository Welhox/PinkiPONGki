import { Player } from "../types/game";

export function mapToPongPlayer(player: Player): {
  username: string;
  isGuest: boolean;
  id?: string;
} {
  const isGuest = player.id == null;
  return {
    username: player.name,
    isGuest,
    // only include an id if it’s not a guest
    ...( !isGuest ? { id: String(player.id) } : {} ),
  };
}