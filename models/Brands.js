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
		catalogs: [
			{
				url: {
					type: String,
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
				photo_url: {
					type: String,
				},
				id: {
					type: String,
				},
			},
		],
		category: [
			{
				type: Number,
				ref: "category",
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
