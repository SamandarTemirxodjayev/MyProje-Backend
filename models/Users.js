const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const usersSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		name: {
			type: String,
			required: true,
		},
		surname: {
			type: String,
		},
		email: {
			type: String,
			// required: true,
			unique: true,
		},
		phone_number: {
			type: String,
			required: true,
			unique: true,
		},
		resume_url: {
			type: String,
			// required: true,
		},
		gender: {
			type: String,
			enum: ["male", "female"],
		},
		password: {
			type: String,
		},
		card_number: {
			type: String,
		},
		price: {
			type: Number,
		},
		direction: {
			type: Number,
			ref: "directions",
		},
		is_submit: {
			type: Boolean,
			default: false,
		},
		visitedRoutes: [
			{
				route: {type: String},
				count: {type: Number, default: 0},
			},
		],
	},
	{
		versionKey: false,
	},
);

usersSchema.plugin(AutoIncrement, {modelName: "users", fieldName: "_id"});

const Users = model("users", usersSchema);

module.exports = Users;
