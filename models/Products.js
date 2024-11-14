const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const productsSchema = new Schema(
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
				color: {
					type: String,
					required: true,
				},
			},
		],
		files: [
			{
				url: {
					type: String,
					required: true,
				},
				name: {
					type: String,
					required: true,
				},
				id: {
					type: String,
					required: true,
				},
			},
		],
		information_photo: {
			type: String,
		},
		information_uz: [
			{
				key: {
					type: String,
					required: true,
				},
				value: {
					type: String,
					required: true,
				},
			},
		],
		information_ru: [
			{
				key: {
					type: String,
					required: true,
				},
				value: {
					type: String,
					required: true,
				},
			},
		],
		information_en: [
			{
				key: {
					type: String,
					required: true,
				},
				value: {
					type: String,
					required: true,
				},
			},
		],
		description_files: [
			{
				url: {
					type: String,
					required: true,
				},
				name: {
					type: String,
					required: true,
				},
				photo_url: {
					type: String,
					required: true,
				},
				id: {
					type: String,
					required: true,
				},
			},
		],
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
		sale: {
			is_sale: {
				type: Boolean,
				default: false,
			},
			percent: {
				type: Number,
				default: 0,
			},
			price: {
				type: Number,
				default: 0,
			},
		},
		price: {
			type: Number,
			default: 0,
			required: true,
		},
		cashback: {
			type: Number,
			default: 0,
		},
		star: {
			type: Number,
			default: 5,
			max: 5,
			min: 0,
		},
		category: {
			type: Number,
			ref: "category",
			required: true,
		},
		subcategory: {
			type: Number,
			ref: "subcategory",
			required: true,
		},
		innercategory: {
			type: Number,
			ref: "innercategory",
			required: true,
		},
		brands: {
			type: Number,
			ref: "brands",
			required: true,
		},
		solution: {
			type: Number,
			ref: "solutions",
			required: true,
		},
		delivery: {
			day: {
				type: Number,
				default: 1,
			},
		},
		createdAt: {
			type: Number,
			default: Date.now(),
		},
		sales: {
			type: Number,
			default: 0,
		},
		quantity: {
			type: Number,
			default: 1,
		},
		comments: [
			{
				user: {
					type: Number,
					ref: "users",
				},
				star: {
					type: Number,
				},
				text: {
					type: String,
				},
				createdAt: {
					type: Number,
					default: new Date(),
				},
			},
		],
		status: {
			type: Boolean,
			default: false,
		},
	},
	{
		versionKey: false,
	},
);

productsSchema.plugin(AutoIncrement, {
	modelName: "products",
	fieldName: "_id",
});

const Products = model("products", productsSchema);

module.exports = Products;
