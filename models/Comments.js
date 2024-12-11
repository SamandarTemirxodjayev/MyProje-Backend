const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
	{
		_id: {
			type: Number,
		},
		user: {
			type: Number,
			ref: "users",
		},
		product: {
			type: Number,
			ref: "products",
		},
		star: {
			type: Number,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
		},
		status: {
			type: Boolean,
			default: false,
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
schema.post("save", async function (doc) {
	const Products = model("products");
	const count = await model("comments").countDocuments({
		product: doc.product,
		status: true,
	});
	await Products.findByIdAndUpdate(doc.product, {comments: count});
});

schema.post("remove", async function (doc) {
	const Products = model("products");
	const count = await model("comments").countDocuments({
		product: doc.product,
		status: true,
	});
	await Products.findByIdAndUpdate(doc.product, {comments: count});
});
schema.plugin(AutoIncrement, {
	modelName: "comments",
	fieldName: "_id",
});

const Comments = model("comments", schema);

module.exports = Comments;
