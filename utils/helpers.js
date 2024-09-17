const Counter = require("../models/Counter");
exports.AutoIncrement = function (schema, options) {
	const {modelName, fieldName, startAt = 1} = options; // Added startAt with a default value

	schema.pre("save", async function (next) {
		if (this.isNew) {
			try {
				const counter = await Counter.findOneAndUpdate(
					{model: modelName, field: fieldName},
					{$inc: {count: 1}},
					{new: true, upsert: true, setDefaultsOnInsert: true},
				);

				if (counter.count === 1 && startAt > 1) {
					// Initialize counter with startAt if it’s the first document and startAt is greater than 1
					await Counter.updateOne(
						{model: modelName, field: fieldName},
						{$set: {count: startAt}},
					);
					this[fieldName] = startAt;
				} else {
					this[fieldName] = counter.count;
				}

				next();
			} catch (err) {
				next(err);
			}
		} else {
			next();
		}
	});
};
