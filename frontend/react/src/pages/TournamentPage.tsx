import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Bracket from "../components/Bracket";
import Victory from "../components/Victory";
import { formatPlayers, formatMatches } from "../utils/initTournament";
import { Match, Player } from "../types/game";
import { useGameSettings } from "../contexts/GameSettingsContext";
import { getTop3FromMatches } from "../utils/getTop3FromMatches";

const TournamentPage = () => {
  const { id } = useParams<{ id: string }>();
  const tournamentId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  const location = useLocation();

  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [finalStandings, setFinalStandings] = useState<Player[]>([]);
  const { settings } = useGameSettings();

  useEffect(() => {
    if (!location.state) {
      navigate("/", { replace: true });
    } else {
      fetchTournamentData();
    }
  }, []);

  const fetchTournamentData = async () => {
    setIsLoading(true);
    try {
      console.log("Tournament id:", id);
      
      // Re-fetch after starting
      const tournamentRes = await api.get(`/tournaments/${id}`);
      let tournament = tournamentRes.data;

      if (tournament.status === "waiting") {
        await api.post(`/tournaments/${id}/start`);
         const updatedTournament = await api.get(`/tournaments/${id}`);
         tournament = updatedTournament.data;
      }

      const playersData = formatPlayers(tournament.participants);
      const formattedMatches = formatMatches(tournament.tournamentMatches);

      setPlayers(playersData);
      setMatches(formattedMatches);

      if (formattedMatches.length === 0 && tournament.data.status === "completed") {
        const top3 = getTop3FromMatches(formattedMatches);
        setFinalStandings(top3);
      }
    } catch (error) {
      console.error("Failed to fetch tournament data:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleMatchPlayed = async (match: Match, winner: Player) => {
    try {
        await api.post(
        `/tournaments/${match.tournamentId}/match/${match.id}/update`,
        { winnerId: winner.id, winnerAlias: winner.name }
        );

        const res = await api.get(`/tournaments/${match.tournamentId}`);
        const updatedMatches = formatMatches(res.data.tournamentMatches);

        setMatches(updatedMatches);

        if (res.data.status === "completed") {
            const top3 = getTop3FromMatches(updatedMatches);
            setFinalStandings(top3);
            console.log("Final standings", top3);
        }
    } catch (error) {
        console.error("Failed to update match:", error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-8 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-teal-700 dark:text-teal-300 mb-6">
        Tournament #{tournamentId}
      </h1>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-300 mb-2">
          Tournament Settings
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <p>
            <strong>Map:</strong>{" "}
            {settings.mapType === "classic"
              ? "Classic"
              : settings.mapType === "corners"
              ? "Corner Walls"
              : "Center Wall"}
          </p>
          <p>
            <strong>Score to Win:</strong> {settings.scoreToWin}
          </p>
          <p>
            <strong>Power-ups:</strong>{" "}
            {settings.powerUpsEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : finalStandings.length > 0 ? (
        <Victory standings={finalStandings} />
      ) : (
        <Bracket matches={matches} onPlay={handleMatchPlayed} />
      )}
    </div>
  );
};

export default TournamentPage;