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

schema.plugin(AutoIncrement, {
	modelName: "comments",
	fieldName: "_id",
});

const Comments = model("comments", schema);

module.exports = Comments;
