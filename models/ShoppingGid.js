const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const shoppingGidSchema = new Schema(
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
		description_uz: {
			type: String,
		},
		description_ru: {
			type: String,
		},
		description_en: {
			type: String,
		},
		brand: {
			type: Number,
			ref: "brands",
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
		createdAt: {
			type: Number,
			default: Date.now(),
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

shoppingGidSchema.statics.findActiveLimited = function (limit = 8) {
	return this.find({status: true}).limit(limit); // Return the query
};

shoppingGidSchema.plugin(AutoIncrement, {
	modelName: "shoppinggid",
	fieldName: "_id",
});

const ShoppingGid = model("shoppinggid", shoppingGidSchema);

module.exports = ShoppingGid;
