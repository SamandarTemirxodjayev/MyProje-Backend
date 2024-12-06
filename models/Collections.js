const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
	{
		_id: {
			type: Number,
		},
		photo_url: {
			type: String,
			required: true,
		},
		title_uz: {
			type: String,
		},
		title_ru: {
			type: String,
		},
		title_en: {
			type: String,
		},
		description: {
			photo_url: {
				type: String,
			},
			text_uz: {
				type: String,
			},
			text_ru: {
				type: String,
			},
			text_en: {
				type: String,
			},
		},
		status: {
			type: Boolean,
			default: true,
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
	modelName: "collection",
	fieldName: "_id",
});

const Collections = model("collections", schema);

module.exports = Collections;
