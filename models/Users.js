const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const usersSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		name: {
			type: String,
			default: "",
		},
		surname: {
			type: String,
			default: "",
		},
		email: {
			type: String,
			unique: true,
			default: "",
		},
		phone_number: {
			type: String,
			default: "",
			unique: true,
		},
		resume_url: {
			type: String,
			default: "",
		},
		photo_urls: [
			{
				url: {
					type: String,
					default: "https://cdn.myproje.uz/large/67529f70b63e267661939b25.webp",
				},
				id: {
					type: String,
					default: "1",
				},
			},
		],
		
		birthday: {
			type: Number,
		},
		gender: {
			type: String,
			enum: ["male", "female"],
			default: "male",
		},
		password: {
			type: String,
		},
		card_number: {
			type: String,
			default: "",
		},
		price: {
			type: Number,
			default: 0,
		},
		directions: {
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
				delete ret.password; // Exclude visitedRoutes
				return ret;
			},
		},
	},
);

usersSchema.plugin(AutoIncrement, {modelName: "users", fieldName: "_id"});

const Users = model("users", usersSchema);

module.exports = Users;
