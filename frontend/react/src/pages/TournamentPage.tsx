import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const TournamentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <h1 className="text-5xl font-bold text-teal-700 dark:text-teal-300 mb-6">
        Tournament #{id}
      </h1>

      <p className="mb-4 text-center max-w-lg">
        This is a placeholder for the tournament bracket and match making logic.
      </p>

      <div className="flex gap-4">
        <button
          className="px-6 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          onClick={() => alert("Bracket not implemented yet!")}
        >
          View Bracket
        </button>
        <button
          className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default TournamentPage;
