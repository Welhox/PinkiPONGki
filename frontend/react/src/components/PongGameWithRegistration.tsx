import React, { useState } from 'react';
import PlayerRegistrationBox from './PlayerRegistrationBox';
import PongGame from './PongGame';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 300;

const PongGameWithRegistration: React.FC = () => {
  const [player1, setPlayer1] = useState<{ username: string; isGuest: boolean } | null>(null);
  const [player2, setPlayer2] = useState<{ username: string; isGuest: boolean } | null>(null);

  if (!player1 || !player2) {
    return (
      <div
        className="flex border rounded shadow-lg bg-gray-900"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <div className="flex-1 flex items-center justify-center border-r border-gray-700">
          {!player1 && (
            <PlayerRegistrationBox label="Player 1" onRegister={setPlayer1} />
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          {!player2 && (
            <PlayerRegistrationBox label="Player 2" onRegister={setPlayer2} />
          )}
        </div>
      </div>
    );
  }

  return <PongGame player1={player1} player2={player2} />;
};

export default PongGameWithRegistration;