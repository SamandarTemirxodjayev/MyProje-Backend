const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const adminsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		name: {
			type: String,
		},
		surname: {
			type: String,
		},
		login: {
			type: String,
			unique: true,
		},
		password: {
			type: String,
		},
		createdAt: {
			type: Number,
			default: Date.now(),
		},
	},
	{
		versionKey: false,
	},
);

adminsSchema.plugin(AutoIncrement, {modelName: "admin", fieldName: "_id"});

const Admins = model("admins", adminsSchema);

module.exports = Admins;
