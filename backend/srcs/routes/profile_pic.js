import fs from 'fs'
import path from 'path'
import prisma from '../prisma.js'
import { authenticate } from '../middleware/authenticate.js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { pipeline } from 'stream/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const UPLOAD_DIR = resolve(__dirname, '../../assets') // absolute path

export async function profilePicRoutes(fastify, opts) {

	// ensure the uploads dir exists
	if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

	fastify.post('/user/profile-pic', { preHandler: authenticate } , async (req, reply) => {
		const userId = req.user?.id;
		if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

		const parts = req.parts();
		for await (const part of parts) {
			if (part.type !== 'file') return;

			const { filename, mimetype } = part;
			const allowedTypes = ['image/jpeg', 'image/png'];
			const maxSize = 2 * 1024 * 1024;
			if (!allowedTypes.includes(mimetype)) {
				return reply.status(400).send({ error: 'Invalid file type' });
			}

			let size = 0;
			const fileExt = path.extname(filename);
			console.log('FILEEXT:', fileExt);
			const safeName = `${userId}_${Date.now()}${fileExt}`;
			const tempPath = path.join(UPLOAD_DIR, safeName);
			const publicPath = `/assets/${safeName}`; // for frontend use

			const writeStream = fs.createWriteStream(tempPath);
			part.file.on('data', chunk => {
				size += chunk.length;
				if (size > maxSize) {
					part.file.destroy();
					writeStream.destroy();
					if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
				}
			});

			try {
				await pipeline(part.file, writeStream);
			} catch (error) {
				return reply.status(400).send({ error: 'Upload failed or file too large' });
			}

			// delete old profile pic if one exists
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (user?.profilePic) {
				const oldPicName = path.basename(user.profilePic);
				const oldPicPath = path.join(UPLOAD_DIR, oldPicName);
				if (fs.existsSync(oldPicPath)) {
					fs.unlinkSync(oldPicPath);
				}
			}

			// update DB with new profile pic path
			await prisma.user.update({
				where: { id: userId },
				data: { profilePic: publicPath },
			});

			return reply.send({ success: true, profilePicUrl: publicPath });
		}
		return reply.status(400).send({ error: 'No file uploaded' });
	});

	// this is never called
	/* fastify.get('/user/profile-pic/:id', { preHandler: authenticate } , async (req, reply) => {
		const { id } = req.params;
		const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

		const fallbackPath = path.join(UPLOAD_DIR, 'default_avatar.png');
		let filePath;

		if (user?.profilePic) {
			const picFileName = path.basename(user.profilePic);
			const localPicPath = path.join(UPLOAD_DIR, picFileName);
			if (fs.existsSync(localPicPath)) {
				filePath = localPicPath;
			} else {
				filePath = fallbackPath;
			}
		} else {
			filePath = fallbackPath;
		}

		return reply.sendFile(path.basename(filePath));
	}); */
}