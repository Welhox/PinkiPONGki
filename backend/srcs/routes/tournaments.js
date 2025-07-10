import prisma from "../prisma.js";
// import { authenticate } from "../middleware/authenticate.js";
import { tournamentsSchemas } from "../schemas/tournamentsSchemas.js";

/* TO-DO list for tournaments:
  need to make sure that too many tournaments cannot be created (some function for cleaning up database of old tournaments)
  same if the tournament creation is left undone */

export async function tournamentsRoute(fastify, _options) {
  // Create a tournament
  fastify.post("/tournaments/create",
    {
      schema: tournamentsSchemas.createTournamentSchema,
      // commented out in order to allow unauthenticated users to create tournaments
      // preHandler: authenticate,
    },
    async (req, reply) => {
      const { name, size, createdById, status } = req.body;
      console.log("Creating tournament with data:", req.body);
      //the schema already validates and returns 400 if not the right size
      // if (![4, 8, 16, 32].includes(size)) return reply.code(400).send({ error: 'Invalid size' });
      try {
      const tournament = await prisma.tournament.create({
        data: {
          name,
          size,
          createdById,
          status,
        },
      });
      reply.send(tournament);
    } catch (error) {
      console.error("Error creating tournament:", error);
      reply.code(500).send({ message: "Server error" });
    }}
  );

  // Register for a tournament
  fastify.post(
    "/tournaments/:id/register",
    { schema: tournamentsSchemas.registerTournamentSchema },
    async (req, reply) => {
      try {
      const { id } = req.params;
      const { userId, alias } = req.body;
      console.log("Registering for tournament with ID:", id, "User ID:", userId, "Alias:", alias);
      const tournament = await prisma.tournament.findUnique({
        where: { id: Number(id) },
        include: {
          participants: true,
        },
      });
      if (!tournament) {
        return reply.code(404).send({ message: "Tournament not found" });
      }
      if (tournament.participants.length >= tournament.size) {
        return reply.code(400).send({ message: "Tournament is full" });
      }
      if (!userId && !alias) {
        return reply.code(400).send({ message: "Either userId or alias is required" });
      }

      const participant = await prisma.tournamentParticipant.create({
        data: {
          tournamentId: Number(id),
          userId: userId || null,
          alias: alias || null,
        },
      });
      reply.send(participant);
    } catch (error) {
      console.error("Error registering for tournament:", error);
      reply.code(500).send({ message: "Server error" });
    }
    }
  );

  // Get all tournaments
  fastify.get(
    "/tournaments/all",
    { schema: tournamentsSchemas.getAllTournamentsSchema },
    async (req, reply) => {
      const tournaments = await prisma.tournament.findMany({
        include: { participants: true, tournamentMatches: true },
        orderBy: { createdAt: "desc" },
      });
      reply.send(tournaments);
    }
  );

  // Get tournament details (including participants and matches)
  fastify.get(
    "/tournaments/:id",
    { schema: tournamentsSchemas.getTournamentSchema },
    async (req, reply) => {
      const { id } = req.params;
      const tournament = await prisma.tournament.findUnique({
        where: { id: Number(id) },
        include: {
          participants: true,
          matches: true,
        },
      });
      reply.send(tournament);
    }
  );

//###############################################################

  // Start a tournament
  fastify.post(
    "/tournaments/:id/start",
    { /* schema: tournamentsSchemas.startTournamentSchema */ },
    async (req, reply) => {
      const { id } = req.params;
      console.log("Starting tournament with ID:", id);
      try {
        const tournament = await prisma.tournament.findUnique({
          where: { id: Number(id) },
          include: { participants: true },
        });
        if (!tournament) {
          return reply.code(404).send({ message: "Tournament not found" });
        }
        if (tournament.status !== "waiting") {
          return reply.code(400).send({ message: "Tournament cannot be started" });
        }
        if (tournament.participants.length < tournament.size) {
          return reply.code(400).send({ message: "Not enough participants to start the tournament" });
        }
        //generate matches based on participants
        const participants = [...tournament.participants].sort(() => Math.random() - 0.5); // Shuffle participants
        const matches = [];

        for (let i = 0; i < participants.length; i += 2) {
            const p1 = participants[i];
            const p2 = participants[i + 1];
            if ((!p1.userId && !p1.alias) || (!p2.userId && !p2.alias)) {
              return reply.code(400).send({ message: "Participant must have a userId or alias" });
            }
              matches.push({
              round: 1,
              tournamentId: tournament.id,
              participant1Id: p1.userId ?? null,
              participant1Alias: p1.alias ?? null,
              participant2Id: p2.userId ?? null,
              participant2Alias: p2.alias ?? null,
            });
        }
        // Create matches in the database
        await prisma.TournamentMatch.createMany({
          data: matches,
        });
        // Update tournament status to 'in_progress'
        const updatedTournament = await prisma.tournament.update({
          where: { id: Number(id) },
          data: { status: "in_progress" },
        });
        console.log("Tournament started successfully:", updatedTournament);
        reply.send(updatedTournament);

      } catch (error) {
        console.error("Error starting tournament:", error);
        reply.code(500).send({ message: "Server error" });
      }
  });
}

//##############################################################
