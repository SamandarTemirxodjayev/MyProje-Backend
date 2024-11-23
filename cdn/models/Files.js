const mongoose = require("mongoose");
const {AutoIncrement} = require("../../utils/helpers");

const filesSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
		},
		file_name: {
			type: String, // Original uploaded file name
		},
		file_id: {
			type: mongoose.Types.ObjectId, // Unique identifier for the file
		},
		file_urls: {
			type: Object,
			required: true,
		},

		admin_id: {
			type: Number,
			ref: "admins", // Reference to the admins collection
		},
		createdAt: {
			type: Number,
			default: Date.now(), // Automatically set the creation timestamp
		},
	},
	{
		versionKey: false, // Disable version key (__v field)
	},
);

// Apply AutoIncrement plugin for the `_id` field
filesSchema.plugin(AutoIncrement, {modelName: "file", fieldName: "_id"});

const Files = mongoose.model("files", filesSchema);

module.exports = Files;
