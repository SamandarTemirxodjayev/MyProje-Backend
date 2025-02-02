const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
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
  modelName: "naznacheniyas",
  fieldName: "_id",
});

const Naznacheniyas = model("naznacheniyas", schema);

module.exports = Naznacheniyas;
