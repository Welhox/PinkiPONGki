import prisma from "../prisma.js";
import { matchResultSchema } from "../schemas/matchesSchemas.js";

export async function matchesRoute(fastify, _options) {
  fastify.post(
    "/matches",
    { /* schema: matchResultSchema */ },
    async (req, reply) => {
      const { player1, player2, winner, /* loser, leftScore, rightScore */ } =
        req.body;

      try {
      // Validate input
      if(player1 === player2 || (winner !== player1 && winner !== player2)) {
        return reply
          .code(400)
          .send({ message: "Invalid match data" });
      }

      // Get the users from the database
      const player1User = await prisma.user.findUnique({
        where: { id : player1 },
      });
      const player2User = await prisma.user.findUnique({
        where: { id: player2 },
      });

      // If either is a guest, skip storing
      if (!player1User || !player2User) {
        return reply
          .code(200)
          .send({ message: "Match not stored (guest involved)" });
      }
      //go though both players and store the match result for each in the database

        // Determine result for player1
        let result = winner === player1 ? "win" : "loss";

        await prisma.match.create({
          data: {
            playerId: player1User.id,
            opponentId: player2User.id,
            result,
            date: new Date(),
          },
        });
/*         // Determine result for player2
        result = winner === player2 ? "win" : "loss";

        await prisma.match.create({
          data: {
            playerId: player2User.id,
            opponentId: player1User.id,
            result,
            date: new Date(),
          },
        }); */
      } catch (error) {
        console.error("Error storing match:", error);
        return reply.code(500).send({ message: "Error storing match" });
      }

        return reply.code(201).send({ message: "Match stored" });
      }
  );
}
