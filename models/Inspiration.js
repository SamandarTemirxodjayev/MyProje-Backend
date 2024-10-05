const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const inspirationsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		products: [
			{
				type: String,
				required: true,
			},
		],
		photo_url: {
			type: String,
			required: true,
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

inspirationsSchema.plugin(AutoIncrement, {
	modelName: "inspiration",
	fieldName: "_id",
});

const Inspiration = model("inspiration", inspirationsSchema);

module.exports = Inspiration;
