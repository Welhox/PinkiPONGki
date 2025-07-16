
//This is a prehandler for restricting APIs to localhost only
export async function devOnly(request, reply) {
  console.log("running devOnly middleware");
  // Allow access only from localhost
  if (request.ip !== "::1" && request.ip !== "127.0.0.1") {
    return reply.code(403).send({ error: "Access denied. This endpoint is only available from localhost." });
  }
}