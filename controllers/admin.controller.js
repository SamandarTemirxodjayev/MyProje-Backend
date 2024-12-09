const Advantages = require("../models/Advantages");
const Brands = require("../models/Brands");
const Category = require("../models/Categories");
const Directions = require("../models/Directions");
const Admins = require("../models/Superadmins");
const Users = require("../models/Users");
const {createHash, compare} = require("../utils/codeHash");
const {createToken, generateHashedToken} = require("../utils/token");
const path = require("path");
const {open} = require("node:fs/promises");
const fs = require("fs/promises");
const {sendEmail} = require("../utils/mail");
const InnerCategory = require("../models/InnerCategory");
const ShoppingGid = require("../models/ShoppingGid");
const Subcategories = require("../models/Subcategories");
const Products = require("../models/Products");
const {modifyResponseByLang, paginate} = require("../utils/helpers");
const Collections = require("../models/Collections");
const Solutions = require("../models/Solutions");
const Colors = require("../models/Colors");
const Orders = require("../models/Orders");
const Comments = require("../models/Comments");
const Infos = require("../models/Infos");

exports.register = async (req, res) => {
	try {
		let hashedCode = await createHash(req.body.password.toString());
		const admin = await Admins.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: hashedCode,
		});
		await admin.save();
		return res.json({
			status: true,
			message: "success",
			data: admin,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.login = async (req, res) => {
	try {
		const admin = await Admins.findOne({
			login: req.body.login,
		});
		if (!admin) {
			return res.status(400).json({
				status: false,
				message: "Login Xato",
				data: [],
			});
		}
		const comparePassword = await compare(req.body.password, admin.password);

		if (!comparePassword) {
			return res.status(400).json({
				status: false,
				message: "Parol Xato",
				data: null,
			});
		}
		const token = createToken(admin._id);
		const cdnToken = generateHashedToken(admin._id);
		return res.json({
			status: true,
			message: "success",
			data: {
				cdn_token: cdnToken,
				auth_token: token,
				token_type: "bearer",
			},
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getUsers = async (req, res) => {
	try {
		let {page = 1, limit = 10, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let categories = await Users.find({...filter})
			.skip(skip)
			.limit(limit);
		const total = await Users.countDocuments({...filter});

		const response = paginate(
			page,
			limit,
			total,
			categories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchUser = async (req, res) => {
	try {
		let {text, page = 1, limit = 10} = req.query;

		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		const searchCriteria = {
			$or: [
				{name: {$regex: text, $options: "i"}},
				{surname: {$regex: text, $options: "i"}},
				{phone_number: {$regex: text, $options: "i"}},
			],
		};

		let categories = await Users.find(searchCriteria).skip(skip).limit(limit);
		const total = await Users.countDocuments();

		const response = paginate(
			page,
			limit,
			total,
			categories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getUserById = async (req, res) => {
	try {
		const {lang} = req.query;
		let user = await Users.findById(req.params.id).populate("direction");
		user = modifyResponseByLang(user, lang, ["direction.name"]);
		return res.json({
			status: true,
			message: "success",
			data: user,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.submitUserById = async (req, res) => {
	try {
		const user = await Users.findById(req.params.id);
		if (!user) {
			return res.status(400).json({
				status: false,
				message: "user not found",
				data: null,
			});
		}
		if (user.is_submit) {
			return res.status(400).json({
				status: false,
				message: "user already submitted",
				data: null,
			});
		}
		console.log(user);
		const text = `${user.name}-${user._id}`;
		user.password = await createHash(text);
		user.is_submit = true;
		await sendEmail(
			user.email,
			`Sizning Ma'lumotlaringiz:\n\n\r<br>Login: ${user.phone_number}\n<br> Parol: ${text}`,
			`Sizning Ma'lumotlaringiz:\n\n<br> Login: ${user.phone_number}\n <br>Parol: ${text}`,
		);
		await user.save();
		return res.json({
			status: true,
			message: "success",
			data: user,
		});
	} catch (error) {
		console.error("JSON Parsing or Other Error: ", error);
		return res.status(500).json({
			status: false,
			message: "Server error occurred",
		});
	}
};
exports.editUserById = async (req, res) => {
	try {
		const user = await Users.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return res.json({
			status: true,
			message: "success",
			data: user,
		});
	} catch (error) {
		console.error("JSON Parsing or Other Error: ", error);
		return res.status(500).json({
			status: false,
			message: "Server error occurred",
		});
	}
};
exports.deleteUserById = async (req, res) => {
	try {
		const user = await Users.findByIdAndDelete(req.params.id);
		return res.json({
			status: true,
			message: "User deleted successfully",
			data: user,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createUser = async (req, res) => {
	try {
		let {password, ...result} = req.body;
		password = await createHash(password);
		const user = await Users.create({
			...result,
			password,
		});
		await user.save();
		return res.json({
			status: true,
			message: "success",
			data: user,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getMe = async (req, res) => {
	try {
		const {password, ...results} = req.admin._doc;
		return res.json({
			status: true,
			message: "success",
			data: results,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createDirections = async (req, res) => {
	try {
		const directions = await Directions.create(req.body);
		await directions.save();
		return res.json({
			status: true,
			message: "success",
			data: directions,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllDirections = async (req, res) => {
	try {
		let {page = 1, limit, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let directions = await Directions.find().skip(skip).limit(limit);
		const total = await Directions.countDocuments();
		directions = modifyResponseByLang(directions, lang, ["name"]);
		const response = paginate(
			page,
			limit,
			total,
			directions,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getDirectionById = async (req, res) => {
	try {
		const {lang} = req.query;
		let direction = await Directions.findById(req.params.id);
		if (!direction) {
			return res.status(400).json({
				status: false,
				message: "directions not found",
				data: null,
			});
		}
		direction = modifyResponseByLang(direction, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: direction,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateDirectionsById = async (req, res) => {
	try {
		const direction = await Directions.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true},
		);
		if (!direction) {
			return res.status(400).json({
				status: false,
				message: "direction not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: direction,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteDirectionsById = async (req, res) => {
	try {
		const direction = await Directions.findByIdAndDelete(req.params.id);
		if (!direction) {
			return res.status(400).json({
				status: false,
				message: "direction not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: direction,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createAdvantages = async (req, res) => {
	try {
		const advantages = await Advantages.create(req.body);
		await advantages.save();
		return res.json({
			status: true,
			message: "success",
			data: advantages,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllAdvantages = async (req, res) => {
	try {
		let {page = 1, limit, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let advantages = await Advantages.find().skip(skip).limit(limit);
		const total = await Advantages.countDocuments();
		advantages = modifyResponseByLang(advantages, lang, [
			"title",
			"description",
		]);
		const response = paginate(
			page,
			limit,
			total,
			advantages,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAdvantagesById = async (req, res) => {
	try {
		const {lang} = req.query;
		let advantage = await Advantages.findById(req.params.id);
		if (!advantage) {
			return res.status(400).json({
				status: false,
				message: "advantage not found",
				data: null,
			});
		}
		advantage = modifyResponseByLang(advantage, lang, ["title", "description"]);
		return res.json({
			status: true,
			message: "success",
			data: advantage,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateAdvantageById = async (req, res) => {
	try {
		const advantage = await Advantages.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true},
		);
		if (!advantage) {
			return res.status(400).json({
				status: false,
				message: "advantage not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: advantage,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteAdvantagesById = async (req, res) => {
	try {
		const advantage = await Advantages.findByIdAndDelete(req.params.id);
		if (!advantage) {
			return res.status(400).json({
				status: false,
				message: "advantage not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: advantage,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createCategory = async (req, res) => {
	try {
		let category = await Category.create(req.body);
		await category.save();
		return res.json({
			status: true,
			message: "success",
			data: category,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getAllCategories = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let categories = await Category.find().skip(skip).limit(limit);
		const total = await Category.countDocuments();

		const categoriesWithQuantity = await Promise.all(
			categories.map(async (category) => {
				const productCount = await Products.countDocuments({
					category: category._id,
				});
				return {...category.toObject(), quantity: productCount};
			}),
		);

		const modifiedCategories = modifyResponseByLang(
			categoriesWithQuantity,
			lang,
			["name"],
		);

		const response = paginate(
			page,
			limit,
			total,
			modifiedCategories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getCategoryById = async (req, res) => {
	try {
		const {lang} = req.query;
		let category = await Category.findById(req.params.id);
		if (!category) {
			return res.status(400).json({
				status: false,
				message: "category not found",
				data: null,
			});
		}
		category = modifyResponseByLang(category, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: category,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchCategories = async (req, res) => {
	try {
		const {text, lang} = req.query;

		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let categories = await Category.aggregate([
			{$match: searchCriteria},
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "category",
					as: "products",
				},
			},
			{
				$addFields: {
					quantity: {$size: "$products"},
				},
			},
			{
				$project: {
					products: 0,
				},
			},
		]);

		categories = modifyResponseByLang(categories, lang, ["name"]);

		return res.json({
			status: true,
			message: "success",
			data: categories,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.updateCategoryById = async (req, res) => {
	try {
		const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!category) {
			return res.status(400).json({
				status: false,
				message: "category not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: category,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteCategoryById = async (req, res) => {
	try {
		const category = await Category.findByIdAndDelete(req.params.id);
		if (!category) {
			return res.status(400).json({
				status: false,
				message: "category not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: category,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createSubCategory = async (req, res) => {
	try {
		const subcategory = await Subcategories.create(req.body);
		await subcategory.save();
		return res.json({
			status: true,
			message: "success",
			data: subcategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllSubCategories = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let subcategory = await Subcategories.find()
			.skip(skip)
			.limit(limit)
			.populate("category");
		const total = await Subcategories.countDocuments();

		subcategory = await Promise.all(
			subcategory.map(async (subcategory) => {
				const productCount = await Products.countDocuments({
					subcategory: subcategory._id,
				});
				return {...subcategory.toObject(), quantity: productCount};
			}),
		);
		subcategory = modifyResponseByLang(subcategory, lang, [
			"category.name",
			"name",
		]);
		const response = paginate(
			page,
			limit,
			total,
			subcategory,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getSubCategoryById = async (req, res) => {
	try {
		const {lang} = req.query;
		let subcategory = await Subcategories.findById(req.params.id).populate(
			"category",
		);

		if (!subcategory) {
			return res.status(400).json({
				status: false,
				message: "subcategory not found",
				data: null,
			});
		}

		// Modify the response including populated fields
		subcategory = modifyResponseByLang(subcategory, lang, [
			"name",
			"category.name",
		]);

		return res.json({
			status: true,
			message: "success",
			data: subcategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchSubcategories = async (req, res) => {
	try {
		const {text, lang} = req.query;

		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let categories = await Subcategories.aggregate([
			{$match: searchCriteria},
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "subcategory",
					as: "products",
				},
			},
			{
				$addFields: {
					quantity: {$size: "$products"},
				},
			},
			{
				$project: {
					products: 0,
				},
			},
		]);

		categories = modifyResponseByLang(categories, lang, ["name"]);

		return res.json({
			status: true,
			message: "success",
			data: categories,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateSubCategoryById = async (req, res) => {
	try {
		const subcategory = await Subcategories.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			},
		);
		if (!subcategory) {
			return res.status(400).json({
				status: false,
				message: "subcategory not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: subcategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteSubCategoryById = async (req, res) => {
	try {
		const subcategory = await Subcategories.findByIdAndDelete(req.params.id);
		if (!subcategory) {
			return res.status(400).json({
				status: false,
				message: "subcategory not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: subcategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createInnerCategory = async (req, res) => {
	try {
		const innercategory = await InnerCategory.create(req.body);
		await innercategory.save();
		return res.json({
			status: true,
			message: "success",
			data: innercategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllInnerCategories = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let innercategories = await InnerCategory.find()
			.skip(skip)
			.limit(limit)
			.populate("subcategory");
		const total = await InnerCategory.countDocuments();

		innercategories = await Promise.all(
			innercategories.map(async (innercategory) => {
				const productCount = await Products.countDocuments({
					innercategory: innercategory._id,
				});
				return {...innercategory.toObject(), quantity: productCount};
			}),
		);
		innercategories = modifyResponseByLang(innercategories, lang, [
			"subcategory.name",
			"name",
		]);
		const response = paginate(
			page,
			limit,
			total,
			innercategories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getInnerCategoryById = async (req, res) => {
	try {
		const {lang} = req.query;
		let innercategory = await InnerCategory.findById(req.params.id).populate(
			"subcategory",
		);
		if (!innercategory) {
			return res.status(400).json({
				status: false,
				message: "innercategory not found",
				data: null,
			});
		}
		innercategory = modifyResponseByLang(innercategory, lang, [
			"name",
			"subcategory.name",
		]);
		return res.json({
			status: true,
			message: "success",
			data: innercategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchinnercategories = async (req, res) => {
	try {
		const {text, lang} = req.query;

		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let categories = await InnerCategory.aggregate([
			{$match: searchCriteria},
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "innercategory",
					as: "products",
				},
			},
			{
				$addFields: {
					quantity: {$size: "$products"},
				},
			},
			{
				$project: {
					products: 0,
				},
			},
		]);

		categories = modifyResponseByLang(categories, lang, ["name"]);

		return res.json({
			status: true,
			message: "success",
			data: categories,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getInnerCategoriesGetByCategoriesId = async (req, res) => {
	try {
		const {lang} = req.query;
		let innercategory = await InnerCategory.find({
			subcategory: req.params.id,
		});
		if (!innercategory) {
			return res.status(400).json({
				status: false,
				message: "innercategories not found",
				data: null,
			});
		}
		innercategory = modifyResponseByLang(innercategory, lang, [
			"name",
			"subcategory.name",
		]);
		return res.json({
			status: true,
			message: "success",
			data: innercategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateInnerCategoryById = async (req, res) => {
	try {
		const innercategory = await InnerCategory.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			},
		);
		if (!innercategory) {
			return res.status(400).json({
				status: false,
				message: "innercategory not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: innercategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteInnerCategoryById = async (req, res) => {
	try {
		const innercategory = await InnerCategory.findByIdAndDelete(req.params.id);
		if (!innercategory) {
			return res.status(400).json({
				status: false,
				message: "innercategory not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: innercategory,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createBrand = async (req, res) => {
	try {
		const brand = await Brands.create(req.body);
		await brand.save();
		return res.json({
			status: true,
			message: "success",
			data: brand,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllBrands = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let categories = await Brands.find()
			.skip(skip)
			.limit(limit)
			.populate("category");
		const total = await Brands.countDocuments();

		const categoriesWithQuantity = await Promise.all(
			categories.map(async (category) => {
				const productCount = await Products.countDocuments({
					brand: category._id,
				});
				return {...category.toObject(), quantity: productCount};
			}),
		);

		const modifiedCategories = modifyResponseByLang(
			categoriesWithQuantity,
			lang,
			["description.history", "category.name"],
		);

		const response = paginate(
			page,
			limit,
			total,
			modifiedCategories,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchBrands = async (req, res) => {
	try {
		let {text, page = 1, limit = 10} = req.query;

		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		const searchCriteria = {
			name: {$regex: text, $options: "i"},
		};

		let categories = await Brands.find(searchCriteria).skip(skip).limit(limit);
		const total = await Brands.countDocuments(searchCriteria);

		const response = paginate(
			page,
			limit,
			total,
			categories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getBrandById = async (req, res) => {
	try {
		const {lang} = req.query;
		let brand = await Brands.findById(req.params.id).populate("category");
		if (!brand) {
			return res.status(400).json({
				status: false,
				message: "brand not found",
				data: null,
			});
		}
		brand = modifyResponseByLang(brand, lang, [
			"description.history",
			"category.name",
		]);
		return res.json({
			status: true,
			message: "success",
			data: brand,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateBrandById = async (req, res) => {
	try {
		const brand = await Brands.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!brand) {
			return res.status(400).json({
				status: false,
				message: "brand not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: brand,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteBrandById = async (req, res) => {
	try {
		const brand = await Brands.findByIdAndDelete(req.params.id);
		if (!brand) {
			return res.status(400).json({
				status: false,
				message: "brand not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: brand,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getUsage = async (req, res) => {
	const {lang} = req.query;
	const filePath = path.join(__dirname, "../database", `usage-rules.json`);
	try {
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		data = modifyResponseByLang(JSON.parse(data), lang, ["rule"]);
		return res.json({
			status: true,
			message: "success",
			data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateUsage = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `usage-rules.json`);

	try {
		// Read the existing usage rules
		let fileContent = await fs.readFile(filePath, "utf8");
		let usageRules = JSON.parse(fileContent);

		// Extract the updated rules for different languages from the request body
		const {rule_uz, rule_en, rule_ru} = req.body;

		// Generate the updatedAt timestamp from the backend
		const updatedAt = Date.now(); // Get the current timestamp

		// Create the updated rule object with language-specific rules
		const updatedRule = {
			rule_uz,
			rule_en,
			rule_ru,
			updatedAt,
		};

		// Find the index of the rule to update (assuming there's one rule)
		if (usageRules.length > 0) {
			usageRules[0] = updatedRule; // Replace the first (and only) rule
		} else {
			// If no rules exist, add the new one
			usageRules.push(updatedRule);
		}

		// Write the updated rules back to the file
		await fs.writeFile(filePath, JSON.stringify(usageRules, null, 2), "utf8");

		// Send success response
		return res.json({
			status: true,
			message: "Usage rules updated successfully",
			data: usageRules,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getLinks = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `links.json`);
	try {
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		return res.json({
			status: true,
			message: "success",
			data: JSON.parse(data),
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateLinks = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `links.json`);

	try {
		// Read the existing links
		let fileContent = await fs.readFile(filePath, "utf8");
		let linksData = JSON.parse(fileContent);

		// Extract the updated links from the request body
		const {email, phone, instagram, telegram, youtube} = req.body;

		// Generate the updatedAt timestamp from the backend
		const updatedAt = Date.now(); // Get the current timestamp

		// Find the first (and only) set of links to update
		if (linksData.length > 0) {
			let currentLinks = linksData[0];

			// Update each field if it exists in the request body
			currentLinks.email = email || currentLinks.email;
			currentLinks.phone = {
				main: phone?.main || currentLinks.phone.main,
				secondary: phone?.secondary || currentLinks.phone.secondary,
			};
			currentLinks.instagram = instagram || currentLinks.instagram;
			currentLinks.telegram = telegram || currentLinks.telegram;
			currentLinks.youtube = youtube || currentLinks.youtube;

			// Update the updatedAt field
			currentLinks.updatedAt = updatedAt;

			// Save the updated links back into the file
			linksData[0] = currentLinks;
		} else {
			// If no links exist, add a new one
			linksData.push({
				email,
				phone,
				instagram,
				telegram,
				youtube,
				updatedAt,
			});
		}

		// Write the updated links back to the file
		await fs.writeFile(filePath, JSON.stringify(linksData, null, 2), "utf8");

		// Send success response
		return res.json({
			status: true,
			message: "Links updated successfully",
			data: linksData,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getIsWorking = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `is-working.json`);
	try {
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		return res.json({
			status: true,
			message: "success",
			data: JSON.parse(data),
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateisWorkding = async (req, res) => {
	const filePath = path.join(__dirname, "../database", "is-working.json");

	try {
		// Read the existing file content
		let fileContent;
		try {
			fileContent = await fs.readFile(filePath, "utf8");
		} catch (err) {
			// If file doesn't exist, initialize it as an empty array
			fileContent = "[]";
		}

		// Parse the JSON content
		let linksData = JSON.parse(fileContent);

		// Extract the updated value from the request body
		const {isworking} = req.body;

		// Validate if `isworking` is provided
		if (typeof isworking === "undefined") {
			return res.status(400).json({
				status: false,
				message: "`isworking` field is required in the request body",
			});
		}

		// Get the current timestamp for `updatedAt`
		const updatedAt = Date.now();

		// If data exists, update the first record, otherwise create a new one
		if (linksData.length > 0) {
			let currentLinks = linksData[0];

			// Update the field and timestamp
			currentLinks.isworking = isworking;
			currentLinks.updatedAt = updatedAt;

			// Save the updated data back
			linksData[0] = currentLinks;
		} else {
			// If no data exists, create a new entry
			linksData.push({
				isworking,
				updatedAt,
			});
		}

		// Write the updated content back to the file
		await fs.writeFile(filePath, JSON.stringify(linksData, null, 2), "utf8");

		// Respond with success
		return res.json({
			status: true,
			message: "`isworking` updated successfully",
			data: linksData,
		});
	} catch (error) {
		console.error("Error updating links:", error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getBalance = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `information.json`);
	try {
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		return res.json({
			status: true,
			message: "success",
			data: JSON.parse(data),
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateBalance = async (req, res) => {
	const filePath = path.join(__dirname, "../database", "information.json");

	try {
		// Read the existing file content
		let fileContent;
		try {
			fileContent = await fs.readFile(filePath, "utf8");
		} catch (err) {
			// If file doesn't exist, initialize it as an empty array
			fileContent = "[]";
		}

		// Parse the JSON content
		let linksData = JSON.parse(fileContent);

		// Extract the updated value from the request body
		const {balance} = req.body;

		// Validate if `isworking` is provided
		if (typeof balance === "undefined") {
			return res.status(400).json({
				status: false,
				message: "`information` field is required in the request body",
			});
		}

		// Get the current timestamp for `updatedAt`
		const updatedAt = Date.now();

		// If data exists, update the first record, otherwise create a new one
		if (linksData.length > 0) {
			let currentLinks = linksData[0];

			// Update the field and timestamp
			currentLinks.balance = balance;
			currentLinks.updatedAt = updatedAt;

			// Save the updated data back
			linksData[0] = currentLinks;
		} else {
			// If no data exists, create a new entry
			linksData.push({
				balance,
				updatedAt,
			});
		}

		// Write the updated content back to the file
		await fs.writeFile(filePath, JSON.stringify(linksData, null, 2), "utf8");

		// Respond with success
		return res.json({
			status: true,
			message: "`balance` updated successfully",
			data: linksData,
		});
	} catch (error) {
		console.error("Error updating links:", error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createShoppingGid = async (req, res) => {
	try {
		const shoppingGid = await ShoppingGid.create(req.body);
		await shoppingGid.save();
		return res.json({
			status: true,
			message: "success",
			data: shoppingGid,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllShoppingGids = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let shoppingGid = await ShoppingGid.find()
			.skip(skip)
			.limit(limit)
			.populate("brand");
		const total = await ShoppingGid.countDocuments();

		const categoriesWithQuantity = await Promise.all(
			shoppingGid.map(async (category) => {
				const productCount = await Products.countDocuments({
					brand: category._id,
				});
				return {...category.toObject(), quantity: productCount};
			}),
		);

		const modifiedCategories = modifyResponseByLang(
			categoriesWithQuantity,
			lang,
			["name", "description"],
		);

		const response = paginate(
			page,
			limit,
			total,
			modifiedCategories,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getActiveLimitedShoppingGids = async (req, res) => {
	try {
		const {lang} = req.query;
		let shoppingGid = await ShoppingGid.findActiveLimited(
			req.params.limit,
		).populate("brand");
		shoppingGid = modifyResponseByLang(shoppingGid, lang, [
			"name",
			"description",
		]);
		console.log(shoppingGid);
		return res.json({
			status: true,
			message: "success",
			data: shoppingGid,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getShoppingGidById = async (req, res) => {
	try {
		const {lang} = req.query;
		let shoppingGid = await ShoppingGid.findById(req.params.id).populate(
			"brand",
		);
		if (!shoppingGid) {
			return res.status(400).json({
				status: false,
				message: "shoppingGid not found",
				data: null,
			});
		}
		shoppingGid = modifyResponseByLang(shoppingGid, lang, [
			"name",
			"description",
		]);
		return res.json({
			status: true,
			message: "success",
			data: shoppingGid,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchShoppingGids = async (req, res) => {
	try {
		let {text, lang, page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let categories = await ShoppingGid.aggregate([
			{$match: searchCriteria},
			{$skip: skip},
			{$limit: limit},
		]);
		const total = await ShoppingGid.countDocuments(searchCriteria);

		categories = modifyResponseByLang(categories, lang, [
			"name",
			"description",
		]);

		const response = paginate(
			page,
			limit,
			total,
			categories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateShoppingGidById = async (req, res) => {
	try {
		const shoppingGid = await ShoppingGid.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true},
		);
		if (!shoppingGid) {
			return res.status(400).json({
				status: false,
				message: "shoppingGid not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: shoppingGid,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteShoppingGidById = async (req, res) => {
	try {
		const shoppingGid = await ShoppingGid.findByIdAndDelete(req.params.id);
		if (!shoppingGid) {
			return res.status(400).json({
				status: false,
				message: "shoppingGid not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: shoppingGid,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createProducts = async (req, res) => {
	try {
		const product = await Products.create(req.body);
		await product.save();
		return res.json({
			status: true,
			message: "success",
			data: product,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllProducts = async (req, res) => {
	try {
		let {page = 1, limit = 10, filter = {}, sort, order, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let query = {};

		const sortOrder = order === "desc" ? -1 : 1;

		// Check if sorting is requested
		let productQuery = Products.find({...filter}).find(query);

		if (sort) {
			productQuery = productQuery.sort({[sort]: sortOrder});
		}

		let products = await productQuery
			.skip(skip)
			.limit(limit)
			.populate("category")
			.populate("subcategory")
			.populate("innercategory")
			.populate("brands")
			.populate("photo_urls.color")
			.populate("solution");

		const total = await Products.countDocuments(query);

		const totalPages = Math.ceil(total / limit);
		products = modifyResponseByLang(products, lang, [
			"name",
			"information",
			"description",
			"innercategory.name",
			"subcategory.name",
			"photo_urls.color.name",
			"category.name",
		]);
		return res.json({
			status: true,
			message: "success",
			data: products,
			_meta: {
				totalItems: total,
				currentPage: page,
				itemsPerPage: limit,
				totalPages: totalPages,
			},
			_links: {
				self: req.originalUrl,
				next:
					page < totalPages
						? `${req.baseUrl}${req.path}?page=${page + 1}&limit=${limit}`
						: null,
				prev:
					page > 1
						? `${req.baseUrl}${req.path}?page=${page - 1}&limit=${limit}`
						: null,
			},
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchProducts = async (req, res) => {
	try {
		let {text, page = 1, limit = 10} = req.query;

		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let categories = await Products.find(searchCriteria)
			.skip(skip)
			.limit(limit);
		const total = await Products.countDocuments(searchCriteria);

		const response = paginate(
			page,
			limit,
			total,
			categories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getProductById = async (req, res) => {
	try {
		const {lang} = req.query;
		let product = await Products.findById(req.params.id)
			.populate("category")
			.populate("subcategory")
			.populate("innercategory")
			.populate("brands")
			.populate("photo_urls.color")
			.populate("solution");
		if (!product) {
			return res.status(400).json({
				status: false,
				message: "product not found",
				data: null,
			});
		}
		product = modifyResponseByLang(product, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: product,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateProductById = async (req, res) => {
	try {
		const product = await Products.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!product) {
			return res.status(400).json({
				status: false,
				message: "product not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: product,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteProductById = async (req, res) => {
	try {
		const product = await Products.findByIdAndDelete(req.params.id);
		if (!product) {
			return res.status(400).json({
				status: false,
				message: "product not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: product,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createCollections = async (req, res) => {
	try {
		const collection = await Collections.create(req.body);
		await collection.save();
		return res.json({
			status: true,
			message: "success",
			data: collection,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllCollections = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let collections = await Collections.find().skip(skip).limit(limit);
		const total = await Collections.countDocuments();
		collections = modifyResponseByLang(collections, lang, ["name"]);
		const response = paginate(
			page,
			limit,
			total,
			collections,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getCollectionsById = async (req, res) => {
	try {
		const {lang} = req.query;
		let collections = await Collections.findById(req.params.id);
		if (!collections) {
			return res.status(400).json({
				status: false,
				message: "collections not found",
				data: null,
			});
		}
		collections = modifyResponseByLang(collections, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: collections,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateCollectionsById = async (req, res) => {
	try {
		const collections = await Collections.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true},
		);
		if (!collections) {
			return res.status(400).json({
				status: false,
				message: "collections not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: collections,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteCollectionsById = async (req, res) => {
	try {
		const collections = await Collections.findByIdAndDelete(req.params.id);
		if (!collections) {
			return res.status(400).json({
				status: false,
				message: "collections not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: collections,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createSolution = async (req, res) => {
	try {
		const solution = await Solutions.create(req.body);
		await solution.save();
		return res.json({
			status: true,
			message: "success",
			data: solution,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllSolutions = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let solutions = await Solutions.find()
			.skip(skip)
			.limit(limit)
			.populate("brand");
		const total = await Solutions.countDocuments();

		const categoriesWithQuantity = await Promise.all(
			solutions.map(async (category) => {
				const productCount = await Products.countDocuments({
					brand: category._id,
				});
				return {...category.toObject(), quantity: productCount};
			}),
		);

		const modifiedCategories = modifyResponseByLang(
			categoriesWithQuantity,
			lang,
			["name"],
		);

		const response = paginate(
			page,
			limit,
			total,
			modifiedCategories,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchSolutions = async (req, res) => {
	try {
		let {text, lang, page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let categories = await Solutions.aggregate([
			{$match: searchCriteria},
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "solution",
					as: "products",
				},
			},
			{
				$addFields: {
					quantity: {$size: "$products"},
				},
			},
			{
				$project: {
					products: 0,
				},
			},
			{$skip: skip},
			{$limit: limit},
		]);
		const total = await Solutions.countDocuments(searchCriteria);

		categories = modifyResponseByLang(categories, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			categories,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getSolutionById = async (req, res) => {
	try {
		const {lang} = req.query;
		let solution = await Solutions.findById(req.params.id).populate("brand");
		if (!solution) {
			return res.status(400).json({
				status: false,
				message: "solution not found",
				data: null,
			});
		}
		solution = modifyResponseByLang(solution, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: solution,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateSolutionById = async (req, res) => {
	try {
		const solution = await Solutions.findByIdAndUpdate(
			req.params.id,
			req.body,
			{new: true},
		);
		if (!solution) {
			return res.status(400).json({
				status: false,
				message: "solution not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: solution,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteSolutionById = async (req, res) => {
	try {
		const solution = await Solutions.findByIdAndDelete(req.params.id);
		if (!solution) {
			return res.status(400).json({
				status: false,
				message: "solution not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: solution,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createColor = async (req, res) => {
	try {
		const color = await Colors.create(req.body);
		await color.save();
		return res.json({
			status: true,
			message: "success",
			data: color,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllColors = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let colors = await Colors.find().skip(skip).limit(limit);
		const total = await Colors.countDocuments();

		colors = modifyResponseByLang(colors, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			colors,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.searchColors = async (req, res) => {
	try {
		let {text, lang, page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		if (!text) {
			return res.status(400).json({
				status: false,
				message: "Search query is required",
			});
		}

		const searchCriteria = {
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		};

		let colors = await Colors.find(searchCriteria).skip(skip).limit(limit);
		const total = await Colors.countDocuments(searchCriteria);

		colors = modifyResponseByLang(colors, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			colors,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getColorById = async (req, res) => {
	try {
		const {lang} = req.query;
		let color = await Colors.findById(req.params.id);
		if (!color) {
			return res.status(400).json({
				status: false,
				message: "color not found",
				data: null,
			});
		}
		color = modifyResponseByLang(color, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: color,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateColorById = async (req, res) => {
	try {
		const color = await Colors.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!color) {
			return res.status(400).json({
				status: false,
				message: "color not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: color,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteColorById = async (req, res) => {
	try {
		const color = await Colors.findByIdAndDelete(req.params.id);
		if (!color) {
			return res.status(400).json({
				status: false,
				message: "color not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: color,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createComment = async (req, res) => {
	try {
		const comment = await Comments.create(req.body);
		await comment.save();
		return res.json({
			status: true,
			message: "success",
			data: comment,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllComments = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let comments = await Comments.find()
			.skip(skip)
			.limit(limit)
			.populate("user")
			.populate("product");
		const total = await Comments.countDocuments();

		comments = modifyResponseByLang(comments, lang, ["product.name"]);

		const response = paginate(
			page,
			limit,
			total,
			comments,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getCommentById = async (req, res) => {
	try {
		const {lang} = req.query;
		let comment = await Comments.findById(req.params.id)
			.populate("user")
			.populate("product");
		if (!comment) {
			return res.status(400).json({
				status: false,
				message: "comment not found",
				data: null,
			});
		}
		comment = modifyResponseByLang(comment, lang, ["product.name"]);
		return res.json({
			status: true,
			message: "success",
			data: comment,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateCommentById = async (req, res) => {
	try {
		const comments = await Comments.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!comments) {
			return res.status(400).json({
				status: false,
				message: "comments not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: comments,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteCommentById = async (req, res) => {
	try {
		const comment = await Comments.findByIdAndDelete(req.params.id);
		if (!comment) {
			return res.status(400).json({
				status: false,
				message: "comment not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: comment,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllOrders = async (req, res) => {
	try {
		let {page = 1, limit = 10, filter = {}, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let orders = await Orders.find({...filter})
			.skip(skip)
			.limit(limit)
			.populate("user")
			.populate("products.product")
			.populate("products.color");
		const total = await Orders.countDocuments({...filter});
		orders = modifyResponseByLang(orders, lang, [
			"products.product.name",
			"products.product.description",
			"products.product.information",
			"products.color.name",
		]);

		const response = paginate(
			page,
			limit,
			total,
			orders,
			req.baseUrl,
			req.path,
		);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getOrderById = async (req, res) => {
	try {
		const {lang} = req.query;
		let order = await Orders.findById(req.params.id)
			.populate("user")
			.populate("products.product")
			.populate("products.color");
		if (!order) {
			return res.status(400).json({
				status: false,
				message: "order not found",
				data: null,
			});
		}
		order = modifyResponseByLang(order, lang, [
			"products.product.name",
			"products.product.description",
			"products.product.information",
			"products.color.name",
		]);

		return res.json({
			status: true,
			message: "success",
			data: order,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.createInfo = async (req, res) => {
	try {
		const info = await Infos.create(req.body);
		await info.save();
		return res.json({
			status: true,
			message: "success",
			data: info,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getAllInfos = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let info = await Infos.find().skip(skip).limit(limit);
		const total = await Infos.countDocuments();

		info = modifyResponseByLang(info, lang, ["name"]);

		const response = paginate(page, limit, total, info, req.baseUrl, req.path);
		return res.json(response);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getInfoById = async (req, res) => {
	try {
		const {lang} = req.query;
		let info = await Infos.findById(req.params.id);
		if (!info) {
			return res.status(400).json({
				status: false,
				message: "info not found",
				data: null,
			});
		}
		info = modifyResponseByLang(info, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: info,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.updateInfoById = async (req, res) => {
	try {
		const info = await Infos.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!info) {
			return res.status(400).json({
				status: false,
				message: "info not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: info,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.deleteInfoById = async (req, res) => {
	try {
		const info = await Infos.findByIdAndDelete(req.params.id);
		if (!info) {
			return res.status(400).json({
				status: false,
				message: "info not found",
				data: null,
			});
		}
		return res.json({
			status: true,
			message: "success",
			data: info,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.submitProductDelivery = async (req, res) => {
	try {
		const {id} = req.params; // Order ID
		const {product_id} = req.body; // Product Array Item ID

		let order = await Orders.findById(id);
		if (!order) {
			return res.status(400).json({status: false, message: "Order not found"});
		}

		const product = order.products.find(
			(item) => item._id.toString() === product_id,
		);
		if (!product) {
			return res
				.status(400)
				.json({status: false, message: "Product not found in the order"});
		}

		product.delivery.delivered.is_delivered = true;
		product.delivery.delivered.date = Date.now();

		await order.save();

		return res.json({
			status: true,
			message: "Product delivery status updated successfully",
			data: order.toObject(),
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({status: false, message: "Internal Server Error"});
	}
};

exports.cancelProductDelivery = async (req, res) => {
	try {
		const {id} = req.params; // Order ID
		const {product_id} = req.body; // Product Array Item ID

		let order = await Orders.findById(id);
		if (!order) {
			return res.status(400).json({status: false, message: "Order not found"});
		}

		const product = order.products.find(
			(item) => item._id.toString() === product_id,
		);
		if (!product) {
			return res
				.status(400)
				.json({status: false, message: "Product not found in the order"});
		}

		product.delivery.cancelled.is_cancelled = true;
		product.delivery.cancelled.date = Date.now();
		product.delivery.cancelled.reason = req.body.reason;

		await order.save();

		return res.json({
			status: true,
			message: "Product delivery status updated successfully",
			data: order.toObject(),
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({status: false, message: "Internal Server Error"});
	}
};
exports.doneOrderDelivery = async (req, res) => {
	try {
		const {id} = req.params; // Order ID

		let order = await Orders.findById(id);
		if (!order) {
			return res.status(400).json({status: false, message: "Order not found"});
		}

		order.status = 2;

		await order.save();

		return res.json({
			status: true,
			message: "Product delivery status updated successfully",
			data: order.toObject(),
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({status: false, message: "Internal Server Error"});
	}
};
