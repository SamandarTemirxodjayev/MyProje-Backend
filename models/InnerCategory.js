const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const innerCategoryiesSchema = new Schema(
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
		subcategory: {
			type: Number,
			ref: "subcategory",
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

innerCategoryiesSchema.plugin(AutoIncrement, {
	modelName: "innercategory",
	fieldName: "_id",
});

const InnerCategory = model("innercategory", innerCategoryiesSchema);

module.exports = InnerCategory;
