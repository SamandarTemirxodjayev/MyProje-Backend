const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const brandsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		name: {
			type: String,
			required: true,
		},
		photo_url: {
			type: String,
			required: true,
		},
		description: {
			country: {
				type: String,
				required: true,
			},
			contact: {
				type: String,
			},
			website: {
				type: String,
			},
			history_uz: {
				type: String,
			},
			history_ru: {
				type: String,
			},
			history_en: {
				type: String,
			},
			photo_urls: [
				{
					url: {
						type: String,
						required: true,
					},
					id: {
						type: String,
						required: true,
					},
				},
			],
		},
		category: [
			{
				type: Number,
				ref: "category",
			},
		],
		solutions: [
			{
				photo_url: {
					type: String,
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
				products: [{type: Number}],
			},
		],
		createdAt: {
			type: Number,
			default: Date.now(),
		},
		is_adsense: {
			type: Boolean,
			default: false,
		},
	},
	{
		versionKey: false,
	},
);

brandsSchema.plugin(AutoIncrement, {
	modelName: "brands",
	fieldName: "_id",
});

const Brands = model("brands", brandsSchema);

module.exports = Brands;
