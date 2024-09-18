const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const directionsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		name_uz: {
			type: String,
			required: true,
		},
		name_ru: {
			type: String,
			required: true,
		},
		name_en: {
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

directionsSchema.plugin(AutoIncrement, {
	modelName: "directions",
	fieldName: "_id",
});

const Directions = model("directions", directionsSchema);

module.exports = Directions;
