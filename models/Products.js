const { Schema, model } = require("mongoose");
const { AutoIncrement } = require("../utils/helpers");

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
		description_files: {
			item_1: {
				url: {
					type: Array,
				},
				name: {
					type: String,
					default: "3D модель",
				},
			},
			item_2: {
				url: {
					type: Array,
				},
				name: {
					type: String,
					default: "Паспорт продукта",
				},
			},
			item_3: {
				url: {
					type: Array,
				},
				name: {
					type: String,
					default: "Текстуры",
				},
			},
		},
		summary_informations: {
			is_have: {
				type: Boolean,
				default: true,
			},
			guarantee: {
				type: Number,
				default: 1,
			},
			x: {
				type: Number,
				default: 1,
			},
			y: {
				type: Number,
				default: 1,
			},
			z: {
				type: Number,
				default: 1,
			},
			weight: {
				type: Number,
				default: 1,
			},
			material: {
				type: Number,
				ref: "materials",
			},
			country: {
				type: Number,
				ref: "countries",
			},
			color: {
				type: Number,
				ref: "colors",
			},
			dizayn: {
				type: Number,
				ref: "dizayns",
			},
			poverxnost: {
				type: Number,
				ref: "poverxnosts",
			},
			naznacheniya: {
				type: Number,
				ref: "naznacheniyas",
			},
			primeneniya: {
				type: Number,
				ref: "primeneniyas",
			},
			stil: {
				type: Number,
				ref: "stils",
			},
			rektifikat: {
				type: Boolean,
				default: false,
			}
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
			default: 0,
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
		shoppinggid: {
			type: Number,
			ref: "shoppinggid",
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
