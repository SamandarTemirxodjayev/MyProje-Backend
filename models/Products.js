const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const productsSchema = new Schema(
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
		photo_urls: [
			{
				url: {
					type: String,
				},
				id: {
					type: String,
				},
				color: {
					type: Number,
					ref: "colors",
				},
			},
		],
		files: [
			{
				url: {
					type: String,
				},
				name: {
					type: String,
				},
				id: {
					type: String,
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
				},
				value: {
					type: String,
				},
			},
		],
		information_ru: [
			{
				key: {
					type: String,
				},
				value: {
					type: String,
				},
			},
		],
		information_en: [
			{
				key: {
					type: String,
				},
				value: {
					type: String,
				},
			},
		],
		description_files: [
			{
				url: {
					type: String,
				},
				name: {
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
		x: {
			type: Number,
		},
		y: {
			type: Number,
		},
		z: {
			type: Number,
		},
		description_uz: {
			type: String,
		},
		description_ru: {
			type: String,
		},
		description_en: {
			type: String,
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
		popular: {
			is_popular: {
				type: Boolean,
				default: false,
			},
		},
		price: {
			type: Number,
			default: 0,
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
		},
		subcategory: {
			type: Number,
			ref: "subcategory",
		},
		innercategory: {
			type: Number,
			ref: "innercategory",
		},
		brands: {
			type: Number,
			ref: "brands",
		},
		solution: {
			type: Number,
			ref: "solutions",
		},
		delivery: {
			day: {
				type: Number,
				default: 1,
			},
			kuryer: {
				amount: {
					type: Number,
					default: 0,
				},
			},
			pick_up: {
				amount: {
					type: Number,
					default: 0,
				},
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
