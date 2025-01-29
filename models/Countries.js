const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
    },
    code: {
      type: String,
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
  modelName: "countries",
  fieldName: "_id",
});

const Countries = model("countries", schema);

module.exports = Countries;
