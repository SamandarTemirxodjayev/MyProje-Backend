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
		products: [
			{
				type: Number,
				required: true,
				ref: "products",
			},
		],
		description: {
			photo_url: {
				type: String,
				required: true,
			},
			text_uz: {
				type: String,
				required: true,
			},
			text_ru: {
				type: String,
				required: true,
			},
			text_en: {
				type: String,
				required: true,
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
