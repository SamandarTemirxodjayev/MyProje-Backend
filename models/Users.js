const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const usersSchema = new Schema(
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
		email: {
			type: String,
			unique: true,
		},
		phone_number: {
			type: String,

			unique: true,
		},
		resume_url: {
			type: String,
		},
		photo_url: {
			type: String,
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
		balance: {
			type: Number,
			default: 0,
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
		toJSON: {
			transform: function (doc, ret) {
				delete ret.visitedRoutes; // Exclude visitedRoutes
				return ret;
			},
		},
	},
);

usersSchema.plugin(AutoIncrement, {modelName: "users", fieldName: "_id"});

const Users = model("users", usersSchema);

module.exports = Users;
