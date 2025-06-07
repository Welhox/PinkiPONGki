
export async function authenticateOptional(request, reply) {
	console.log('running optional authenticate middleware')
	try {
	// Check if the request has a valid JWT token and store it for time validation
		const currentToken = await request.jwtVerify();

		if (!currentToken?.id || !currentToken?.username) {
			return;
		}

		request.user = {
			id: currentToken.id,
			username: currentToken.username,
		};

		const now = Math.floor(Date.now() / 1000); // Get the current time in seconds
		const timeLeft = currentToken.exp - now; // Calculate the time left until expiration
		// If the token is about to expire (less than 15 minutes left), refresh it
		if (timeLeft < 15 * 60) {
		// Create a new token with the same payload and a new expiration time
		const newToken = await request.jwtSign(
			{ id: currentToken.id, username: currentToken.username },
			{ expiresIn: '1h' },
		);
		// Set the new token in the cookie
		reply.setCookie('token', newToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
			maxAge: 60 * 60, // 1 hour in seconds
		});
		}
  } catch (err) {
	// invalid or no token - no need to throw
	return;
  }
}

/* 
export async function authenticateOptional(request, reply) {
	console.log('running optional authenticate middleware')
	try {
	// Check if the request has a valid JWT token and store it for time validation
		const token = request.cookies.token;
		if (!token) return; // no token, skip authentication

		// decode token without verifying (to read exp and payload)
		const decoded = jwt.decode(token, { complete: true });
		if (!decoded || !decoded.payload) return;

		const now = Math.floor(Date.now() / 1000); // Get the current time in seconds
		const exp = decoded.payload.exp;

		if (!decoded.payload.id || !decoded.payload.username) return; // invalid payload, skip auth

		const timeLeft = exp - now; // Calculate the time left until expiration

		if (timeLeft > 0) {
			// token is valid (not expired), verify fully and refresh if near expiry
			const currentToken = await request.jwtVerify();

			request.user = {
				id: currentToken.id,
				username: currentToken.username,
			};

			// If the token is about to expire (less than 15 minutes left), refresh it
			if (timeLeft < 15 * 60) {
				// Create a new token with the same payload and a new expiration time
				const newToken = await request.jwtSign(
					{ id: currentToken.id, username: currentToken.username },
					{ expiresIn: '5min' },
				);
				// Set the new token in the cookie
				reply.setCookie('token', newToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					path: '/',
					maxAge: 5 * 60, // 1 hour in seconds
				});
			}	
		} else if (timeLeft >= -5 * 60) {
			// token expired but within 5 minute grace period
			// issue a new token without verifying
			const newToken = await request.jwtSign(
				{ id: decoded.payload.id, username: decoded.payload.username },
				{ expiresIn: '5min' },
			);
			reply.setCookie('token', newToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				path: '/',
				maxAge: 5 * 60,
			});
			// attach user to request
			request.user = {
				id: decoded.payload.id,
				username: decoded.payload.username,
			};
		} else {
			return; // token expired longer than grace period - no auth
		}
  } catch (err) {
	// invalid or no token - no need to throw
	return;
  }
}
*/