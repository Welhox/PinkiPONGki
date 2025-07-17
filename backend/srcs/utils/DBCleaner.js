//A recurrently running function which cleans up the database
import prisma from "../prisma.js";


async function DBCleaner() {
	console.log("[DBCleaner] Executing DB cleanup");
	// Get a 6h old timestamp
	const sixHourAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
	try {
		//check for tournaments that are older than 6 hours and delete them
		const deletedTournaments = await prisma.tournament.deleteMany({
			where: {
				updatedAt: { lt: sixHourAgo }
			}
		})
		console.log(`[DBCleaner] deleted ${deletedTournaments.count} old tournaments`)
		//check for expired OTPs
		const deletedOtps = await prisma.otp.deleteMany({
			where: { expiresAt: { lt: new Date() }
			}
		})
		console.log(`[DBCleaner] deleted ${deletedOtps.count} old OTPs`)

	} catch(error) {
		console.error("[DBCleaner] DB cleanup failed: ", error);
	}
}

export function startDBCleaner(intervalMS = 60 * 60 * 1000) {
	console.log(`[DBCleaner] started`)
	DBCleaner();
	setInterval(DBCleaner, intervalMS);
}