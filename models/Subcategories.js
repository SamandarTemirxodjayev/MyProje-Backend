const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const subcategoryiesSchema = new Schema(
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
			},
		],
		category: {
			type: Number,
			ref: "category",
		},
		popular: {
			is_popular: {
				type: Boolean,
				default: false,
			},
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

subcategoryiesSchema.plugin(AutoIncrement, {
	modelName: "subcategory",
	fieldName: "_id",
});

const Subcategories = model("subcategory", subcategoryiesSchema);

module.exports = Subcategories;
