const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const subscribesSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		email: {
			type: String,
		},
		user_id: {
			type: Number,
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

subscribesSchema.plugin(AutoIncrement, {
	modelName: "subscribe",
	fieldName: "_id",
});

const Subscribes = model("subscribe", subscribesSchema);

module.exports = Subscribes;
