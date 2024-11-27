const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
	{
		_id: {
			type: Number,
		},
		name_uz: {
			type: String,
		},
		name_ru: {
			type: String,
		},
		name_en: {
			type: String,
		},
		code: {
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

schema.plugin(AutoIncrement, {
	modelName: "colors",
	fieldName: "_id",
});

const Colors = model("colors", schema);

module.exports = Colors;
