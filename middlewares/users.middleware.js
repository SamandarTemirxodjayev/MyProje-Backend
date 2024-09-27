const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Users = require("../models/Users");
dotenv.config();

async function UserMiddleware(req, res, next) {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return res
			.status(401)
			.set({
				"Content-Type": "application/json",
				"WWW-Authenticate": 'Bearer realm="api"',
			})
			.json({
				error: "Not Authorized!",
				message: "Missing authorization header",
			});
	}

	const accessToken = authorizationHeader.split(" ")[1];
	if (!accessToken) {
		return res
			.status(401)
			.json({error: "Not Authorized!", message: "Invalid access token"});
	}

	try {
		// Decode the token to get user information
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
		const user = await Users.findById(decoded);
		if (!user) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "Invalid access token"});
		}

		// Record the visited route
		const currentRoute = req.originalUrl;
		let routeEntry = user.visitedRoutes.find(
			(route) => route.route === currentRoute,
		);

		if (routeEntry) {
			// If the route has already been visited, increment the count
			routeEntry.count += 1;
		} else {
			// If it's the first time visiting this route, add it to the array
			user.visitedRoutes.push({route: currentRoute, count: 1});
		}

		// Save the user with updated route info
		await user.save();

		// Attach the user to the request for further usage
		req.user = user;

		// Proceed to the next middleware or route handler
		return next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "Invalid access token"});
		}
		return res
			.status(500)
			.json({error: "Internal Server Error", message: "An error occurred"});
	}
}

module.exports = UserMiddleware;
