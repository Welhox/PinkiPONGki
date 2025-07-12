import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Bracket from "../components/Bracket";
import Victory from "../components/Victory";
import { Match, Player } from "../types/game";
import { useGameSettings } from "../contexts/GameSettingsContext";
import { generateInitialMatches } from "../utils/generateInitialMatches";
import { handleMatchPlayed as handleMatchPlayedUtil } from "../utils/handleMatchPlayed";

import {
  fetchTournamentWithMatches,
  formatPlayers,
  formatMatches,
  startTournamentIfWaiting,
} from "../utils/initTournament";

const TournamentPage = () => {
  const { id } = useParams<{ id: string }>();
  const tournamentId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  const location = useLocation(); // for testing without backend

  const [players, setPlayers] = useState<Player[]>([]);
  const [matchesFromBackend, setMatchesFromBackend] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const { settings } = useGameSettings();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [finalStandings, setFinalStandings] = useState<Player[]>([]);

  useEffect(() => {
    if (!location.state) {
      navigate("/", { replace: true });
    } else {
      fetchTournamentData();
    }
  }, [location.state, navigate]);

  const fetchTournamentData = async () => {
    setIsLoading(true);

    try {
      let data = await fetchTournamentWithMatches(tournamentId);

      const playersData = formatPlayers(data.participants);
      setPlayers(playersData);

      let backendMatches = formatMatches(data.matches);
      setMatchesFromBackend(backendMatches);

      if (backendMatches.length === 0 && data.status === "waiting") {
        try {
          const startedData = await startTournamentIfWaiting(tournamentId);
          const updatedMatches = formatMatches(startedData.matches);
          setMatchesFromBackend(updatedMatches);
        } catch (startError) {
          console.error("Failed to start tournament:", startError);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tournament data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchPlayed = async (match: Match, winner: Player) => {
    await handleMatchPlayedUtil(
      match,
      winner,
      matchesFromBackend,
      upcomingMatches,
      {
        setMatchesFromBackend,
        setUpcomingMatches,
        setFinalStandings,
      }
    );
  };

  const allMatches = [...matchesFromBackend, ...upcomingMatches];

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
        <Bracket matches={allMatches} onPlay={handleMatchPlayed} />
      )}
    </div>
  );
};

export default TournamentPage;
