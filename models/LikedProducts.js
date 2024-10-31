const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const likedProductsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		user_id: {
			type: Number,
			ref: "users",
			required: true,
		},
		product_id: {
			type: Number,
			ref: "products",
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

likedProductsSchema.plugin(AutoIncrement, {
	modelName: "liked_products",
	fieldName: "_id",
});

const LikedProducts = model("liked_products", likedProductsSchema);

module.exports = LikedProducts;
