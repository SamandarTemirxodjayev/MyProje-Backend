const path = require("path");
const {open} = require("node:fs/promises");
const fs = require("fs/promises");
async function SiteMiddleware(req, res, next) {
	try {
		const filePath = path.join(__dirname, "../database", `is-working.json`);
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		data = JSON.parse(data);
		if (!data[0].isworking) {
			return res.status(400).json({
				status: false,
				message: "websites are not working",
				data: null,
			});
		}
		return next();
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({error: "Internal Server Error", message: "An error occurred"});
	}
}

module.exports = SiteMiddleware;
