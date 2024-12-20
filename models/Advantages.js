const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const advantagesSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		title_uz: {
			type: String,
			required: true,
		},
		title_ru: {
			type: String,
			required: true,
		},
		title_en: {
			type: String,
			required: true,
		},
		description_uz: {
			type: String,
			required: true,
		},
		description_ru: {
			type: String,
			required: true,
		},
		description_en: {
			type: String,
			required: true,
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

advantagesSchema.plugin(AutoIncrement, {
	modelName: "advantages",
	fieldName: "_id",
});

const Advantages = model("advantages", advantagesSchema);

module.exports = Advantages;
