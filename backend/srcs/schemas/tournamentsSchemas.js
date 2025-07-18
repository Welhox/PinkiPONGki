// schemas/tournamentSchemas.js

// Shared schema for a tournament information
const participantSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    tournamentId: { type: "integer" },
    userId: { type: ["integer", "null"] },
    alias: { type: ["string", "null"] },
    joinedAt: { type: "string", format: "date-time" },
  },
/*   required: ["id", "tournamentId", "userId", "alias", "joinedAt"], */
};

const tournamentMatchSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    tournamentId: { type: "integer" },
    round: { type: "integer" },
    player1Id: { type: ["integer", "null"] },
    player1Alias: { type: ["string", "null"] },
    player2Id: { type: ["integer", "null"] },
    player2Alias: { type: ["string", "null"] },
    winnerId: { type: ["integer", "null"] },
    winnerAlias: { type: ["string", "null"] },
    status: { type: "string", enum: ["waiting", "in_progress", "completed", "archived"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
/*   required: [
    "id",
    "tournamentId",
    "round",
    "player1Id",
    "player1Alias",
    "player2Id",
    "player2Alias",
    "winnerId",
    "winnerAlias",
    "status",
  ], */
};

// Schema for creating a tournament
const createTournamentSchema = {
  description: "Create a new tournament",
  tags: ["tournaments"],
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      size: { type: "integer", enum: [4, 8] },
      createdById: { type: "integer" },
      status: { type: "string", enum: ["waiting"] },
    },
    required: ["name", "size"/* , "createdById" */, "status"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        size: { type: "integer" },
        createdById: { type: "integer" },
        status: { type: "string", enum: ["waiting"] },
      },
/*       required: [
        "id",
        "name",
        "size",
        // "createdById",
        "status",
      ], */
    },
    400: {
      type: "object",
      properties: { error: { type: "string", example: "Invalid size" } },
      required: ["error"],
    },
    500: {
      type: "object",
      properties: { message: { type: "string", example: "Server error" } },
      required: ["message"],
    },
  },
};

// Schema for registering a participant
const registerTournamentSchema = {
  description: "Register a user for a tournament",
  tags: ["tournaments"],
  params: {
    type: "object",
    properties: {
      id: { type: "integer", minimum: 1 },
    },
    required: ["id"],
  },
  body: {
    type: "object",
    properties: {
      userId: { type: "integer" },
      alias: { type: "string" },
    },
    additionalProperties: false,
    anyOf: [
      {required: ["userId"] },
      {required: ["alias"] },
    ]
  },
  response: {
    200: participantSchema,
    204: {
      description: "No-op: already registered",
      type: "null",
    },
    400: {
      type: "object",
      properties: {
        message: { type: "string", example: "Invalid tournament ID" },
      },
      required: ["message"],
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament not found" },
      },
      required: ["message"],
    },
    500: {
      type: "object",
      properties: { message: { type: "string", example: "Server error" } },
      required: ["message"],
    },
  },
};

// Schema for listing all tournaments
const getAllTournamentsSchema = {
  description: "Get all tournaments (with participants and matches)",
  tags: ["tournaments"],
  response: {
    200: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          size: { type: "integer" },
          createdById: { type: "integer" },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          participants: { type: "array", items: participantSchema },
          tournamentMatches: {
            type: "array",
            items: tournamentMatchSchema ,
          }
        },
/*         required: [
          "id",
          "name",
          "size",
          "createdById",
          "status",
          "participants",
        ], */
      },
    },
    500: {
      type: "object",
      properties: { message: { type: "string", example: "Server error" } },
      required: ["message"],
    },
  },
};

//Schema for fetching a single tournament by ID
const getTournamentSchema = {
  description: "Get a single tournament by ID (with participants & matches)",
  tags: ["tournaments"],
  params: {
    type: "object",
    properties: {
      id: { type: "integer", minimum: 1 },
    },
    required: ["id"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        size: { type: "integer" },
        createdById: { type: "integer" },
        status: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        winnerId: { type: ["integer", "null"] },
        winnerAlias: { type: ["string", "null"] },
        participants: { type: "array", items: participantSchema },
        tournamentMatches: {
          type: "array",
          items: tournamentMatchSchema,
        },
      },
/*       required: [
        "id",
        "name",
        "size",
        "status",
        "participants",
        "tournamentMatches",
      ], */
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament not found" },
      },
      required: ["message"],
    },
    500: {
      type: "object",
      properties: { message: { type: "string", example: "Server error" } },
      required: ["message"],
    },
  },
};

// schema for starting a tournament
const startTournamentSchema = {
  description: "Start a tournament",
  tags: ["tournaments"],
  params: {
    type: "object",
    properties: {
      id: { type: "integer", minimum: 1 },
    },
    required: ["id"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        size: { type: "integer" },
        createdById: { type: "integer" },
        status: { type: "string", enum: ["in_progress"] },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        participants: {
          type: "array",
          items: participantSchema,
        },
        tournamentMatches: {
          type: "array",
          items: tournamentMatchSchema,
      }},
/*       required: [
        "id", 
        "name", 
        "size", 
        "createdById", 
        "status", 
        "participants", 
        "tournamentMatches"
      ], */
    },
    400: {
      type: "object",
      properties: {
        message: { type: "string", example: "Invalid tournament ID" },
      },
      required: ["message"],
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament not found" },
      },
      required: ["message"],
    },
    500: {
      type: "object",
      properties: { message: { type: "string", example: "Server error" } },
      required: ["message"],
    },
  },
};

//scheam for updating a tournament match
const updateTournamentMatchSchema = {
  description: "Update a tournament match",
  tags: ["tournaments"],
  params: {
    type: "object",
    properties: {
      id: { type: "integer", minimum: 1 },
      matchId: { type: "integer", minimum: 1 },
    },
    required: ["id", "matchId"],
  },
  body: {
    type: "object",
    properties: {
      winnerId: { type: ["integer", "null"] },
      winnerAlias: { type: ["string", "null"] },
    }
  },
  response: {
  200: {
    ...tournamentMatchSchema,
  },
  400: {
    type: "object",
    properties: {
      message: { type: "string", example: "Invalid match ID" },
    },
    required: ["message"],
  },
  404: {
    type: "object",
    properties: {
      message: { type: "string", example: "Match not found" },
    },
    required: ["message"],
  },
  500: {
    type: "object",
    properties: { message: { type: "string", example: "Server error" } },
    required: ["message"],
  },
}};
  
//schema for deleting a tournament
const deleteTournamentSchema = {
  description: "Delete a tournament",
  tags: ["tournaments"],
  params: {
    type: "object",
    properties: {
      id: { type: "integer", minimum: 1 },
      name: { type: "string" },
    },
    required: ["id", "name"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament deleted successfully" },
      },
      required: ["message"],
    },
    404: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tournament not found" },
      },
      required: ["message"],
    },
    500: {
      type: "object",
      properties: { message: { type: "string", example: "Server error" } },
      required: ["message"],
    },
  },
};

export const tournamentsSchemas = {
  deleteTournamentSchema,
  updateTournamentMatchSchema,
  startTournamentSchema,
  createTournamentSchema,
  registerTournamentSchema,
  getAllTournamentsSchema,
  getTournamentSchema,
};