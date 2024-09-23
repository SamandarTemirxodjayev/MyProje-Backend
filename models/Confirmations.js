const {Schema, model, Types} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const confirmSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		type: {
			type: String,
			required: true,
		},
		uuid: {
			type: Types.ObjectId,
			// required: true,
		},
		code: {
			type: String,
			required: true,
		},
		data: {
			type: String,
			required: true,
		},
		expiredAt: {
			type: Date,
			required: true,
		},
		createdAt: {
			type: Number,
			default: Date.now,
		},
	},
	{
		versionKey: false,
	},
);

confirmSchema.statics.checkAndDeleteExpired = async function (uuid) {
	const confirmation = await this.findOne({uuid});

	if (!confirmation) {
		return {expired: true};
	}

	if (confirmation.expiredAt < new Date()) {
		await this.findByIdAndDelete(confirmation._id);
		return {expired: true};
	}

	return {expired: false, confirmation: confirmation};
};
confirmSchema.plugin(AutoIncrement, {
	modelName: "confirmation",
	fieldName: "_id",
});

const Confirmations = model("confirmations", confirmSchema);

module.exports = Confirmations;
