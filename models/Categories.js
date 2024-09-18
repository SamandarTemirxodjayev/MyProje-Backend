const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const categoryiesSchema = new Schema(
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
