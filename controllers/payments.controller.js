exports.PaymeHandler = async (req, res) => {
	try {
		return res.json({
			data: "test",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
