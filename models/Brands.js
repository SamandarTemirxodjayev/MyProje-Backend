const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const brandsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		name: {
			type: String,
			required: true,
		},
		photo_url: {
			type: String,
			required: true,
		},
		category: [
			{
				type: Number,
				ref: "category",
			},
		],
		createdAt: {
			type: Number,
			default: Date.now(),
		},
		is_adsense: {
			type: Boolean,
			default: false,
		},
	},
	{
		versionKey: false,
	},
);

brandsSchema.plugin(AutoIncrement, {
	modelName: "category",
	fieldName: "_id",
});

const Brands = model("brands", brandsSchema);

module.exports = Brands;
