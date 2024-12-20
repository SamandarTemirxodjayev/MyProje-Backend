const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const innerCategoryiesSchema = new Schema(
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
		popular: {
			is_popular: {
				type: Boolean,
				default: false,
			},
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
