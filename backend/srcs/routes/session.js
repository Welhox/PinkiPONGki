
import { authenticate } from '../middleware/authenticate.js'
import prisma from '../prisma.js'
import fs from 'fs'
import path from 'path'

export async function sessionRoute(fastify, options) {

	// for session verification; returns username and user ID
	fastify.get('/session/user', async (req, reply) => {
		await authenticate(req, reply);
		if (reply.sent) return;

		if (!req.user || !req.user.id || !req.user.username) {
			return reply.code(401).send({ error: 'Unauthorized' });
		}

		const { id, username } = req.user;

		try {
			const user = await prisma.user.findUnique({
				where: { id: req.user.id },
				select: { profilePic: true },
			});

			let profilePic = null;

			if (user?.profilePic && fs.existsSync(user.profilePic)) {
				profilePic = `/assets/profile-pics/${path.basename(user.profilePic)}`;
			} else {
				profilePic = '/assets/default_avatar.png';
			}

			return reply.send({ id, username, profilePic });
	
		} catch (error) {
			console.error('Session route failed:', error);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});
}