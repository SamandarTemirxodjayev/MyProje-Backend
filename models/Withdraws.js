const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
	{
		_id: {
			type: Number,
		},
		user: {
			type: Number,
			ref: "users",
		},
		card_holder: {
			type: String,
		},
		card_number: {
			type: String,
		},
		amount: {
			type: Number,
		},
		status: {
			type: Number,
			default: 0,
			// 0-created, 1-payed, -1-cancelled with money, -2-cancelled without money
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

schema.plugin(AutoIncrement, {
	modelName: "withdraws",
	fieldName: "_id",
});

const Withdraws = model("withdraws", schema);

module.exports = Withdraws;
