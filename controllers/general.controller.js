const path = require("path");
const {open} = require("node:fs/promises");
exports.getIsWorking = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `is-working.json`);
	try {
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		return res.json({
			status: true,
			message: "success",
			data: JSON.parse(data),
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
