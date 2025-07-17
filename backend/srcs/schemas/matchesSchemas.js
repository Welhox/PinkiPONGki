//Schemas for validating input data

export const matchResultSchema = {
  body: {
    type: "object",
    required: [
      "player1",
      "player2",
      "winner",
    ],
    properties: {
      player: { type: "integer", minimum: 1 },
      opponent: { type: "integer", minimum: 1 },
      winner: { type: "integer", minimum: 1 },
    },
  },
  response: {
    200: { type: "object",properties: { message: { type: "string" } } },
    201: { type: "object",properties: { message: { type: "string" } } },
    400: { type: "object",properties: { error: { type: "string" } } },
    500: { type: "object",properties: { error: { type: "string" } } },
  },
};
