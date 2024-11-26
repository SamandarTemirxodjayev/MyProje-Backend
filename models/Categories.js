const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const categoryiesSchema = new Schema(
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
		photo_url: {
			type: String,
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

categoryiesSchema.plugin(AutoIncrement, {
	modelName: "category",
	fieldName: "_id",
});

const Category = model("category", categoryiesSchema);

module.exports = Category;
