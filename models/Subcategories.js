const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const subcategoryiesSchema = new Schema(
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
		photo_url: {
			type: String,
			required: true,
		},
		category: {
			type: Number,
			ref: "category",
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
