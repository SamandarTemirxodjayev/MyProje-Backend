const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const solutionsSchema = new Schema(
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
		brand: {
			type: Number,
			ref: "brands",
		},
		photo_urls: [
			{
				url: {
					type: String,
				},
				id: {
					type: String,
				},
			},
		],
		createdAt: {
			type: Number,
			default: Date.now(),
		},
	},
	{
		versionKey: false,
	},
);

solutionsSchema.plugin(AutoIncrement, {
	modelName: "solutions",
	fieldName: "_id",
});

const Solutions = model("solutions", solutionsSchema);

module.exports = Solutions;
