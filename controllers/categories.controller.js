const Category = require("../models/Categories");

exports.createCategory = async (req, res) => {
	try {
		const category = await Category.create(req.body);
		return res.json({
			status: true,
			message: "success",
			data: category,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
