const Advantages = require("../models/Advantages");
const Brands = require("../models/Brands");
const Category = require("../models/Categories");
const Confirmations = require("../models/Confirmations");
const Directions = require("../models/Directions");
const Users = require("../models/Users");
const {compare, createHash} = require("../utils/codeHash");
const {sendEmail} = require("../utils/mail");
const {createToken} = require("../utils/token");
const mongoose = require("mongoose");
const path = require("path");
const {open} = require("node:fs/promises");
const ShoppingGid = require("../models/ShoppingGid");
const Subcategories = require("../models/Subcategories");
const InnerCategory = require("../models/InnerCategory");
const Products = require("../models/Products");
const {modifyResponseByLang} = require("../utils/helpers");
const Subscribes = require("../models/Subscribes");
const Inspiration = require("../models/Inspiration");

exports.register = async (req, res) => {
	try {
		const user = await Users.create(req.body);
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
exports.login = async (req, res) => {
	try {
		const user = await Users.findOne({
			phone_number: req.body.phone_number,
		});
		if (!user) {
			return res.status(400).json({
				status: false,
				message: "user not found",
				data: null,
			});
		}
		if (!user.is_submit) {
			return res.status(400).json({
				status: false,
				message: "user not submitted",
				data: null,
			});
		}
		const isPasswordValid = await compare(req.body.password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: false,
				message: "invalid password",
				data: null,
			});
		}
		const token = await createToken(user._id);
		return res.json({
			status: true,
			message: "success",
			data: {
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
exports.editProfile = async (req, res) => {
	try {
		const user = await Users.findByIdAndUpdate(req.user._id, req.body, {
			new: true,
		});
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
		const user = await Users.findById(req.user._id).populate("direction");
		const {password, ...result} = user._doc;
		return res.json({
			status: true,
			message: "success",
			data: result,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.resetPassword = async (req, res) => {
	try {
		const isPasswordValid = await compare(req.body.old, req.user.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: false,
				message: "invalid password",
				data: null,
			});
		}
		const hashedCode = await createHash(req.body.new);
		req.user.password = hashedCode;
		await req.user.save();
		const token = await createToken(req.user._id);
		return res.json({
			status: true,
			message: "success",
			data: {
				token,
				user: req.user,
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
exports.restorePassword = async (req, res) => {
	try {
		const {email} = req.body;
		const user = await Users.findOne({
			email,
		});
		if (!user) {
			return res.status(400).json({
				status: false,
				message: "user not found",
				data: null,
			});
		}
		let confirmationw = await Confirmations.findOne({data: email});

		if (confirmationw) {
			let {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
				confirmationw.uuid,
			);
			if (!expired) {
				return res.status(400).json({
					status: "waiting",
					message: "Confirmation already exists",
					data: {
						id: confirmation._id,
						uuid: confirmation.uuid,
						type: confirmation.type,
						createdAt: confirmation.createdAt,
						expiredAt: confirmation.expiredAt,
					},
				});
			}
		}
		const id = new mongoose.Types.ObjectId();
		let code = Math.floor(1000 + Math.random() * 9000);
		await sendEmail(
			email,
			`Tasdiqlash kodi: ${code}`,
			`Tasdiqlash kodi: ${code}`,
		);
		let hashedCode = await createHash(code.toString());
		const newConfirmation = new Confirmations({
			type: "email",
			code: hashedCode,
			uuid: id,
			data: email,
			expiredAt: new Date(Date.now() + 1000 * 2 * 60),
		});
		await newConfirmation.save();

		return res.status(200).json({
			status: 200,
			message: "Email sent",
			data: {
				id: newConfirmation._id,
				uuid: id,
				type: "email",
				createdAt: newConfirmation.createdAt,
				expiredAt: newConfirmation.expiredAt,
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
exports.restorePasswordConfirm = async (req, res) => {
	try {
		const {uuid} = req.params;
		const {code} = req.body;
		const confirmations = await Confirmations.findOne({uuid});
		if (!confirmations) {
			return res.status(404).json({
				status: false,
				message: "Xatolik",
			});
		}
		const {expired, confirmation} = await Confirmations.checkAndDeleteExpired(
			uuid,
		);

		if (expired) {
			return res.status(400).json({
				status: false,
				message: "Qaytadan yuborin, kodni muddati tugagan",
			});
		}

		const isMatch = await compare(code.toString(), confirmation.code);
		if (!isMatch) {
			return res.status(400).json({
				status: "error",
				message: "Kod Xato",
			});
		}
		const user = await Users.findOne({
			email: confirmation.data,
		});

		await Confirmations.findOneAndDelete({uuid});
		const text = `${user.name}-${user._id}`;
		const password = await createHash(text);
		user.password = password;
		await user.save();
		await sendEmail(
			user.email,
			`Sizning Ma'lumotlaringiz:\n\n\r<br>Login: ${user.phone_number}\n<br> Parol: ${text}`,
			`Sizning Ma'lumotlaringiz:\n\n<br> Login: ${user.phone_number}\n <br>Parol: ${text}`,
		);

		const token = await createToken(user._id);

		return res.json({
			status: true,
			message: "Tasdiqlandi",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				user,
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
exports.getDirections = async (req, res) => {
	try {
		const {lang} = req.query;
		let directions = await Directions.find();
		directions = modifyResponseByLang(directions, lang, ["name"]);
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
exports.getAdvantages = async (req, res) => {
	try {
		const {lang} = req.query;
		let advantages = await Advantages.find();
		advantages = modifyResponseByLang(advantages, lang, [
			"title",
			"description",
		]);
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
exports.getSubCategories = async (req, res) => {
	try {
		const {lang} = req.query;
		let subcategories = await Subcategories.find();
		subcategories = modifyResponseByLang(subcategories, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: subcategories,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getSubCategoriesById = async (req, res) => {
	try {
		const {lang} = req.query;
		let subcategory = await Subcategories.findById(req.params.id);
		const productCount = await Products.countDocuments({
			subcategory: req.params.id,
		});
		subcategory = modifyResponseByLang(subcategory, lang, ["name"]);
		const categoryWithQuantity = {
			...subcategory,
			quantity: productCount,
		};
		return res.json({
			status: true,
			message: "success",
			data: categoryWithQuantity,
		});
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

		let innercategory = await InnerCategory.findById(req.params.id);
		if (!innercategory) {
			return res.status(404).json({
				status: false,
				message: "innercategory not found",
			});
		}

		const productCount = await Products.countDocuments({
			intercategory: req.params.id,
		});

		innercategory = modifyResponseByLang(innercategory, lang, ["name"]);

		const categoryWithQuantity = {
			...innercategory,
			quantity: productCount,
		};

		return res.json({
			status: true,
			message: "success",
			data: categoryWithQuantity,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getCategories = async (req, res) => {
	try {
		const {lang} = req.query;
		let {page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let categories = await Category.find().skip(skip).limit(limit);
		const total = await Category.countDocuments();
		const totalPages = Math.ceil(total / limit);
		categories = modifyResponseByLang(categories, lang, ["name"]);
		return res.json({
			status: true,
			message: "success",
			data: categories,
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
		console.log(error);
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
			return res.status(404).json({
				status: false,
				message: "Category not found",
			});
		}

		const productCount = await Products.countDocuments({
			category: req.params.id,
		});

		category = modifyResponseByLang(category, lang, ["name"]);

		const categoryWithQuantity = {
			...category,
			quantity: productCount,
		};

		return res.json({
			status: true,
			message: "success",
			data: categoryWithQuantity,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getSubcategoriesByCategoryId = async (req, res) => {
	try {
		const {lang} = req.query;
		let {page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		// Fetch subcategories by category ID
		let categories = await Subcategories.find({
			category: req.params.id,
		})
			.skip(skip)
			.limit(limit);

		// Count total number of subcategories
		const total = await Subcategories.countDocuments({
			category: req.params.id,
		});

		// Calculate total pages
		const totalPages = Math.ceil(total / limit);

		// For each subcategory, count products related to subcategory._id
		for (let i = 0; i < categories.length; i++) {
			const subcategoryId = categories[i]._id;
			const productCount = await Products.countDocuments({
				subcategory: subcategoryId,
			});

			// Add quantity key to each category with the count of products
			categories[i] = categories[i].toObject(); // Convert Mongoose document to plain object
			categories[i].quantity = productCount;
		}

		// Modify response for the correct language
		categories = modifyResponseByLang(categories, lang, ["name"]);

		// Return the response
		return res.json({
			status: true,
			message: "success",
			data: categories,
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
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getBrands = async (req, res) => {
	try {
		let {page = 1, limit = 10, category, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let query = {};

		if (category) {
			const categoryId = parseInt(category);
			query.category = {
				$in: [categoryId],
			};
		}

		const brands = await Brands.find({...filter})
			.find(query)
			.skip(skip)
			.limit(limit);

		const total = await Brands.countDocuments(query);

		const totalPages = Math.ceil(total / limit);
		return res.json({
			status: true,
			message: "success",
			data: brands,
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
						? `${req.baseUrl}${req.path}?page=${page + 1}&limit=${limit}${
								category ? `&category=${category}` : ""
						  }`
						: null,
				prev:
					page > 1
						? `${req.baseUrl}${req.path}?page=${page - 1}&limit=${limit}${
								category ? `&category=${category}` : ""
						  }`
						: null,
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
exports.getWorking = async (req, res) => {
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
exports.getShoppingGidLimited = async (req, res) => {
	try {
		const {lang} = req.query;
		let shoppingGids = await ShoppingGid.findActiveLimited(
			req.query.limit,
		).populate("brand");
		shoppingGids = modifyResponseByLang(shoppingGids, lang, [
			"name",
			"description",
		]);
		return res.json({
			status: true,
			message: "success",
			data: shoppingGids,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getSubcategoriesWithInnerCategories = async (req, res) => {
	try {
		const {lang} = req.query;
		const {categoryId} = req.params;

		const subcategories = await Subcategories.find({
			category: categoryId,
		}).lean();

		let subcategoriesWithInnerCategories = await Promise.all(
			subcategories.map(async (subcategory) => {
				const innerCategories = await InnerCategory.find({
					subcategory: subcategory._id,
				}).lean();

				return {
					...subcategory,
					innerCategories,
				};
			}),
		);
		subcategoriesWithInnerCategories = modifyResponseByLang(
			subcategoriesWithInnerCategories,
			lang,
			["name", "innerCategories.name"],
		);

		return res.json({
			status: true,
			message: "success",
			data: subcategoriesWithInnerCategories,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getinnercategoriesBySubcategoryid = async (req, res) => {
	try {
		const {lang} = req.query;
		let {page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		// Fetch inner categories by subcategory ID
		let categories = await InnerCategory.find({
			subcategory: req.params.id,
		})
			.skip(skip)
			.limit(limit);

		// Count total number of inner categories
		const total = await InnerCategory.countDocuments({
			subcategory: req.params.id,
		});

		// Calculate total pages
		const totalPages = Math.ceil(total / limit);

		// For each innercategory, count products related to intercategory._id
		for (let i = 0; i < categories.length; i++) {
			const intercategoryId = categories[i]._id;
			const productCount = await Products.countDocuments({
				intercategory: intercategoryId,
			});

			// Add quantity key to each category with the count of products
			categories[i] = categories[i].toObject(); // Convert Mongoose document to plain object
			categories[i].quantity = productCount;
		}

		// Modify response for the correct language
		categories = modifyResponseByLang(categories, lang, ["name"]);

		// Return the response
		return res.json({
			status: true,
			message: "success",
			data: categories,
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
		console.log(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.getProducts = async (req, res) => {
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
			.populate("intercategory")
			.populate("brands");

		const total = await Products.countDocuments(query);

		const totalPages = Math.ceil(total / limit);
		products = modifyResponseByLang(products, lang, [
			"name",
			"information",
			"description",
			"intercategory.name",
			"subcategory.name",
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
exports.getinspirations = async (req, res) => {
	try {
		let {page = 1, limit = 10, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		// Build the query with the filter
		let query = {...filter};

		// Query the Inspiration model
		let productQuery = Inspiration.find(query).skip(skip).limit(limit);

		// Execute the query
		const products = await productQuery;

		// Get the total number of documents
		const total = await Inspiration.countDocuments(query);

		// Calculate the total number of pages
		const totalPages = Math.ceil(total / limit);

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

exports.subscribeUserByEmail = async (req, res) => {
	try {
		let email = await Subscribes.findOne({
			email: req.body.email,
		});
		if (email) {
			return res.status(400).json({
				status: false,
				message: "User already subscribed",
			});
		}
		email = await Subscribes.create({
			email: req.body.email,
			user_id: req.user._id,
		});
		await email.save();
		return res.json({
			status: true,
			message: "success",
			data: email,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getStatistics = async (req, res) => {
	try {
		const brands = await Brands.countDocuments();

		return res.json({
			status: true,
			message: "success",
			data: {
				brands,
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
