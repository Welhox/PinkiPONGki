import prisma from "../prisma.js";
import { matchResultSchema } from "../schemas/matchesSchemas.js";
import { authenticate } from "../middleware/authenticate.js";

export async function matchesRoute(fastify, _options) {
  fastify.post(
    "/matches",
    { schema: matchResultSchema, preHandler: authenticate },
    async (req, reply) => {
      const { player1, player2, winner } = req.body;

      try {
      // Validate input
      if(player1 === player2 || (winner !== player1 && winner !== player2)) {
        return reply
          .code(400)
          .send({ error: "Invalid match data" });
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

      // Determine result for player1
      const result = winner === player1 ? "win" : "loss";

      await prisma.match.create({
        data: {
          playerId: player1User.id,
          opponentId: player2User.id,
          result,
          date: new Date(),
        },
      });

      } catch (error) {
        console.error("Error storing match:", error);
        return reply.code(500).send({ error: "Error storing match" });
      }
        return reply.code(201).send({ message: "Match stored" });
      }
  );
}
