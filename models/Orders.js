const {Schema, model, Types} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
	{
		_id: {
			type: Number,
		},
		user: {
			type: Number,
			required: true,
			ref: "users",
		},
		products: [
			{
				product: {
					type: Number,
					ref: "products",
				},
				quantity: {
					type: Number,
					default: 0,
				},
				color: {
					type: Number,
					ref: "colors",
				},
				price: {
					type: Number,
					default: 0,
				},
				initial_price: {
					type: Number,
					default: 0,
				},
				delivery: {
					delivered: {
						is_delivered: {
							type: Boolean,
							default: false,
						},
						date: {
							type: Number,
							default: 0,
						},
					},
					cancelled: {
						is_cancelled: {
							type: Boolean,
							default: false,
						},
						date: {
							type: Number,
							default: 0,
						},
						reason: {
							type: String,
							default: "null",
						},
					},
				},
			},
		],
		bonus: {
			type: Number,
			default: 0,
		},
		buyer: {
			project_name: String,
			name: String,
			surname: String,
			phone_number: String,
			email: String,
		},
		communication: {
			full_name: String,
			email: String,
			phone_number: String,
			comment: String,
		},
		delivery: {
			address: String,
			kv: String,
			pd: String,
			is_private_house: Boolean,
			type: {
				type: String,
			},
		},
		status: {
			type: Number,
			default: 0,
		},
		pay: {
			type: {
				type: String,
			},
			card: {
				uuid: {
					type: String,
					default: null,
				},
				card_pan: {
					type: String,
					default: null,
				},
				payment_amount: {
					type: Number,
					default: null,
				},
				amount: {
					type: Number,
					default: null,
				},
				total_amount: {
					type: Number,
					default: null,
				},
				commission_amount: {
					type: Number,
					default: null,
				},
			},
			payme: {
				id: {
					type: Types.ObjectId,
					default: null,
				},
				amount: {
					type: Number,
					default: null,
				},
				total_amount: {
					type: Number,
					default: null,
				},
				create_time: {
					type: Number,
					default: null,
				},
				perform_time: {
					type: Number,
					default: 0,
				},
				cancel_time: {
					type: Number,
					default: 0,
				},
				state: {
					type: Number,
					default: 1,
				},
				bonus: {
					type: Number,
					default: 0,
				},
				reason: {
					type: Number,
					default: null,
				},
			},
			click: {
				click_trans_id: {
					type: String,
					default: null,
				},
				service_id: {
					type: Number,
					default: null,
				},
				click_paydoc_id: {
					type: String,
					default: null,
				},
				merchant_trans_id: {
					type: Types.ObjectId,
					default: null,
				},
				merchant_prepare_id: {
					type: Number,
					default: null,
				},
				merchant_confirm_id: {
					type: Number,
					default: null,
				},
				amount: {
					type: Number,
					default: null,
				},
				total_amount: {
					type: Number,
					default: null,
				},
				action: {
					type: Number,
					default: 0,
				},
			},
			uzum: {
				serviceId: {
					type: Number,
					default: null,
				},
				transId: {
					type: String,
					default: null,
				},
				amount: {
					type: Number,
					default: null,
				},
				total_amount: {
					type: Number,
					default: null,
				},
				paymentSource: {
					type: String,
					default: null,
				},
				tariff: {
					type: String,
					default: null,
				},
				confirmTime: {
					type: Number,
					default: null,
				},
				reverseTime: {
					type: Number,
					default: null,
				},
				status: {
					type: String,
					default: "CREATED",
				},
			},
			created_date: {
				type: Date,
				default: Date.now,
			},
			pay_date: {
				type: Date,
				default: null,
			},
			uuid: {
				type: String,
				default: null,
			},
			status: {
				type: String,
				default: "created",
			},
			order_url: {
				type: String,
			},
		},
		cancel: {
			reason: {
				type: String,
				default: null,
			},
			date: {
				type: Date,
				default: null,
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

schema.plugin(AutoIncrement, {
	modelName: "orders",
	fieldName: "_id",
});

const Orders = model("orders", schema);

module.exports = Orders;
