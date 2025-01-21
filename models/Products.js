const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const productsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		id_code: {
			type: String,
		},
		compare_products: [
			{
				type: Number,
				ref: 'products',
			}
		],
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
					type: Array,
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
					type: Array,
				},
				name: {
					type: String,
				},
				photo_url: {
					type: Array,
				},
				id: {
					type: String,
				},
			},
		],
		information_photos: [
			{
				url: {
					type: String,
				},
				id: {
					type: String,
				},
			},
		],
		information_uz: [
			{
				key: {
					type: Number,
					ref: "infos",
				},
				value: {
					type: String,
				},
			},
		],
		information_ru: [
			{
				key: {
					type: Number,
					ref: "infos",
				},
				value: {
					type: String,
				},
			},
		],
		information_en: [
			{
				key: {
					type: Number,
					ref: "infos",
				},
				value: {
					type: String,
				},
			},
		],
		description_files: [
			{
				url: {
					type: Array,
				},
				name: {
					type: String,
				},
				photo_url: {
					type: Array,
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
		collection: {
			type: Number,
			ref: "collections",
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
		status: {
			type: Boolean,
			default: false,
		},
	},
	{
		versionKey: false,
	},
);
productsSchema.virtual("comments", {
	ref: "comments",
	localField: "_id",
	foreignField: "product",
	count: true,
});

productsSchema.plugin(AutoIncrement, {
	modelName: "products",
	fieldName: "_id",
});

const Products = model("products", productsSchema);

module.exports = Products;
