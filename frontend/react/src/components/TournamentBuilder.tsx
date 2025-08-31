import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import PlayerRegistrationBox from "./PlayerRegistrationBox";
import api from "../api/axios";
import { useGameSettings } from "../contexts/GameSettingsContext";
import CustomAliasField from "./CustomAliasField";
import { useTranslation } from "react-i18next";

type RegisteredPlayer = {
  username: string;
  isGuest: boolean;
  userId: number | null;
};

const usernameRegex = /^[a-zA-Z0-9]+$/;

const isAliasTaken = (
  alias: string,
  players: RegisteredPlayer[],
  excludeIndex?: number
) => players.some((p, i) => i !== excludeIndex && p.username === alias);

const makeUniqueAlias = (
  base: string,
  players: RegisteredPlayer[],
  excludeIndex?: number
) => {
  const root = base.trim();
  if (!isAliasTaken(root, players, excludeIndex)) return root;
  let n = 2;
  while (isAliasTaken(`${root}${n}`, players, excludeIndex)) n++;
  return `${root}${n}`;
};

const isPlayerListValid = (players: RegisteredPlayer[]) => {
  return players.every(
    (p) =>
      p.username &&
      usernameRegex.test(p.username) &&
      p.username.length >= 2 &&
      p.username.length <= 20
  );
};

const TournamentBuilder = () => {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<boolean[]>([]);
  const [currentRegistrationIndex, setCurrentRegistrationIndex] = useState(0);
  const [finalizedCustomName, setFinalizedCustomName] = useState<Set<number>>(
    new Set()
  );
  const [tournamentName, setTournamentName] = useState("");
  const [userInserted, setUserInserted] = useState(false);
  const { user } = useAuth();
  const { settings } = useGameSettings();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (playerCount > 0) {
      const initialPlayers: RegisteredPlayer[] = Array.from(
        { length: playerCount },
        () => ({
          username: "",
          isGuest: true,
          userId: null,
        })
      );

      setPlayers(initialPlayers);
      setRegisteredPlayers(initialPlayers.map(() => false)); // if username is filled, mark as registered
      setCurrentRegistrationIndex(initialPlayers.findIndex((p) => !p.username)); // start from first unfilled
      setUserInserted(false);
    }
  }, [playerCount]);

  useEffect(() => {
    // This useEffect should only be triggered when the user changes
    if (user && players.length > 0 && !userInserted) {
      const updatedPlayers = [...players];
      const alreadyInSlot = updatedPlayers.some(
        (p) => !p.isGuest && p.userId === user.id
      );
      if (alreadyInSlot) {
        setUserInserted(true);
        return;
      } // prevent duplicates

      const firstGuestIndex = updatedPlayers.findIndex(
        (p) => p.isGuest && !p.username
      );
      if (firstGuestIndex !== -1) {
        const uniqueAlias = makeUniqueAlias(
          user.username,
          updatedPlayers,
          firstGuestIndex
        );

        updatedPlayers[firstGuestIndex] = {
          username: uniqueAlias,
          isGuest: false,
          userId: Number(user.id),
        };
        setPlayers(updatedPlayers); // Only update state here

        const updatedRegistered = [...registeredPlayers];
        updatedRegistered[firstGuestIndex] = true;
        setRegisteredPlayers(updatedRegistered);

        setCurrentRegistrationIndex(updatedRegistered.findIndex((r) => !r));
        setUserInserted(true);
      }
    }
  }, [user, players, registeredPlayers, userInserted]);

  const updatePlayer = async (
    index: number,
    player: { username: string; isGuest: boolean; id?: string }
  ) => {
    const requested = player.username.trim();
    const uniqueAlias = makeUniqueAlias(requested, players, index);

    // Convert player object to RegisteredPlayer format
    const registeredPlayer: RegisteredPlayer = {
      username: uniqueAlias,
      isGuest: player.isGuest,
      userId: player.id ? parseInt(player.id) : null,
    };

    // prevent re-login of logged-in user
    if (user && index !== 0 && registeredPlayer.username === user.username) {
      alert(t("tournament.errorAlreadyLoggedIn", { username: user.username }));
      return;
    }
    // enforce username rules
    if (
      !usernameRegex.test(registeredPlayer.username) ||
      registeredPlayer.username.length < 2 ||
      registeredPlayer.username.length > 20
    ) {
      alert(t("tournament.errorUsernameInvalid"));
      return;
    }

    setPlayers((prev) => {
      const next = [...prev];
      next[index] = registeredPlayer;
      return next;
    });
    setRegisteredPlayers((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    // Advance to the next unregistered player
    const nextUnregistered = registeredPlayers.findIndex((_, i) => {
      return !registeredPlayers[i] && i !== index;
    });

    setCurrentRegistrationIndex((prev) => {
      for (let i = index + 1; i < playerCount; i++) {
        if (!registeredPlayers[i] && i !== index) return i;
      }
      return playerCount; // All done
    });

    if (uniqueAlias !== requested) {
      alert(
        t("tournament.errorCreateUniqueAlias", {
          username: requested,
        })
      );
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    console.log(t("tournament.consoleCreating"));
    e.preventDefault();

    // basic validation
    if (!isPlayerListValid(players)) {
      alert(t("tournament.errorAllPlayersRequired"));
      return;
    }

    try {
      // Default the name if blank
      const name = tournamentName.trim() || t("tournament.placeholder");

      // Create tournament
      const res = await api.post("/tournaments/create", {
        name,
        size: playerCount,
        createdById: user?.id,
        status: "waiting",
      });

      const id = res.data.id;

      // Register all players
      for (const player of players) {
        await api.post(`/tournaments/${id}/register`, {
          userId: player.userId,
          alias: player.username,
        });
        console.log(`Registered ${player.username} to tournament ${id}`);
      }

      // Navigate to the tournament page
      navigate(`/tournament/${id}`, {
        state: { accessKey: "pinkiponki" }, // placeholder if needed
      });
    } catch (err) {
      console.error("Tournament creation failed", err);
      alert(t("tournament.errorTournamentCreation"));
    }
  };

  const inputStyles =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 m-1 w-xs dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  const buttonStyles =
    "px-5 mx-3 py-5 my-2 text-white bg-teal-700 hover:bg-teal-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm w-full sm:w-auto py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-800";

  if (playerCount === 0)
    return (
      <div>
        <h1 className="text-6xl text-center text-teal-800 dark:text-teal-300 m-3">
          {t("tournament.createTitle")}
        </h1>
        <div className="flex flex-col">
          <button className={buttonStyles} onClick={() => setPlayerCount(4)}>
            {t("tournament.4playerMode")}
          </button>
          <button className={buttonStyles} onClick={() => setPlayerCount(8)}>
            {t("tournament.8playerMode")}
          </button>
        </div>
      </div>
    );
  else
    return (
      <div className="flex flex-col">
        <h1 className="text-6xl text-center text-teal-800 dark:text-teal-300 m-3">
          {t("tournament.createTitle")}
        </h1>

        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-2">
            {t("tournament.gameSettings")}
          </h3>

          <div className="grid grid-cols-2 gap-4 dark:text-white">
            <p>
              <strong>{t("tournament.map")}:</strong>{" "}
              {settings.mapType === "classic"
                ? t("tournament.mapClassic")
                : settings.mapType === "corners"
                ? t("tournament.mapCorners")
                : t("tournament.mapCenter")}
            </p>
            <p>
              <strong>{t("tournament.scoreToWin")}:</strong>{" "}
              {settings.scoreToWin}
            </p>
            <p>
              <strong>{t("tournament.powerUps")}:</strong>{" "}
              {settings.powerUpsEnabled
                ? t("tournament.enabled")
                : t("tournament.disabled")}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center mb-4">
          <label
            className="dark:text-white mb-2 font-bold"
            htmlFor="nameTournament"
          >
            {t("tournament.nameYourTournament")}
          </label>
          <input
            id="nameTournament"
            placeholder={t("tournament.placeholder")}
            type="text"
            value={tournamentName}
            className="dark:text-white mb-2 p-2 border rounded w-100"
            onChange={(e) => setTournamentName(e.target.value)}
            maxLength={50}
          />
        </div>
        <p className="dark:text-white">{t("tournament.enterUsernames")}</p>
        <div className="flex flex-col">
          {players.map((player, index) => (
            <div key={index} className="my-2">
              {registeredPlayers[index] ? (
                <CustomAliasField
                  index={index}
                  username={player.username}
                  finalized={finalizedCustomName.has(index)}
                  isYou={!!user && player.userId === Number(user.id)}
                  onUpdate={(newName) => {
                    const duplicate = players.some(
                      (p, i) => i !== index && p.username === newName
                    );
                    if (duplicate) {
                      alert(
                        t("tournament.errorUsernameTaken", {
                          username: newName,
                        })
                      );
                      return;
                    }

                    const updated = [...players];
                    updated[index] = {
                      ...updated[index],
                      username: newName,
                    };
                    setPlayers(updated);
                    setFinalizedCustomName((prev) => new Set(prev).add(index));
                  }}
                />
              ) : index === currentRegistrationIndex ? (
                <PlayerRegistrationBox
                  label={`${t("tournament.playerLabel")} ${index + 1}`}
                  onRegister={(p) => updatePlayer(index, p)}
                  playerId={index + 1}
                />
              ) : null}
            </div>
          ))}
          {registeredPlayers.every(Boolean) && (
            <button className={buttonStyles} onClick={handleCreateTournament}>
              {t("tournament.createButton")}
            </button>
          )}
        </div>
      </div>
    );
};
export default TournamentBuilder;
