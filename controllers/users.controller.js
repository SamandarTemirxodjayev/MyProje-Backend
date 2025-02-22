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
const {modifyResponseByLang, paginate} = require("../utils/helpers");
const Subscribes = require("../models/Subscribes");
const Inspiration = require("../models/Collections");
const Solutions = require("../models/Solutions");
const LikedProducts = require("../models/LikedProducts");
const Collections = require("../models/Collections");
const Colors = require("../models/Colors");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const sharp = require("sharp");
const Orders = require("../models/Orders");
const Comments = require("../models/Comments");
const Withdraws = require("../models/Withdraws");
const Counter = require("../models/Counter");
const Materials = require("../models/Materials");
const Countries = require("../models/Countries");
const Dizayns = require("../models/Dizayns");
const Poverxnosts = require("../models/Poverxnosts");
const Naznacheniyas = require("../models/Naznacheniyas");
const Primeneniyas = require("../models/Primeneniyas");
const Stils = require("../models/Stils");

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
		const {lang} = req.query;
		const user = await Users.findById(req.user._id).populate("directions");
		let {password, visitedRoutes, ...result} = user._doc;
		result = modifyResponseByLang(result, lang, ["directions.name"]);
		const filePath = path.join(__dirname, "../database", `information.json`);
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		data = JSON.parse(data); //data[0].balance

		const maxBalance = data[0]?.balance ?? 0; // Ensure balance exists in data
		const userBalance = result.balance ?? 0; // Ensure user balance exists
		result.balance_percentage =
			maxBalance > 0
				? parseInt(((userBalance / maxBalance) * 100).toFixed(2)) // Percentage with 2 decimal places
				: 0;

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
		let {page = 1, limit = 10, lang, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let directions = await Directions.find({...filter})
			.skip(skip)
			.limit(limit);
		const total = await Directions.countDocuments({...filter});
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
exports.searchProductandCategories = async (req, res) => {
	try {
		const {lang, text, limit} = req.query;
		let products = await Products.find({
			$or: [
				{name_uz: {$regex: text, $options: "i"}},
				{name_ru: {$regex: text, $options: "i"}},
				{name_en: {$regex: text, $options: "i"}},
			],
		})
			.populate("category")
			.populate("subcategory")
			.populate("innercategory")
			.populate("brands")
			.populate("collection")
			.populate("summary_informations.color")
			.populate("summary_informations.material")
			.populate("summary_informations.stil")
			.populate("summary_informations.primeneniya")
			.populate("summary_informations.naznacheniya")
			.populate("summary_informations.poverxnost")
			.populate("summary_informations.dizayn")
			.populate("summary_informations.country")
			.populate("information_uz.key")
			.populate("information_ru.key")
			.populate("information_en.key")
			.populate("solution")
			.populate("comments")
			.limit(limit);
		products = modifyResponseByLang(products, lang, [
			"name",
			"information",
			"description",
			"innercategory.name",
			"summary_informations.color.name",
			"summary_informations.primeneniya.name",
			"summary_informations.stil.name",
			"summary_informations.dizayn.name",
			"summary_informations.poverxnost.name",
			"summary_informations.naznacheniya.name",
			"summary_informations.material.name",
			"collection.name",
			"subcategory.name",
			"category.name",
		]);
		return res.json({
			status: true,
			message: "success",
			data: products,
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
		let {page = 1, limit = 10, lang, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let advantages = await Advantages.find({...filter})
			.skip(skip)
			.limit(limit);
		const total = await Advantages.countDocuments({...filter});
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
exports.getSubCategories = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let subcategories = await Subcategories.find({...filter})
			.skip(skip)
			.limit(limit);
		const total = await Subcategories.countDocuments({...filter});
		subcategories = modifyResponseByLang(subcategories, lang, ["name"]);
		const response = paginate(
			page,
			limit,
			total,
			subcategories,
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
			innercategory: req.params.id,
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
		let {page = 1, limit = 10, lang, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let categories = await Category.find({...filter})
			.skip(skip)
			.limit(limit);
		const total = await Category.countDocuments({...filter});
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
		let {lang, page = 1, limit = 10} = req.query;
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

		for (let i = 0; i < categories.length; i++) {
			const subcategoryId = categories[i]._id;
			const productCount = await Products.countDocuments({
				subcategory: subcategoryId,
			});

			categories[i] = categories[i].toObject(); // Convert Mongoose document to plain object
			categories[i].quantity = productCount;
		}

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

exports.getBrands = async (req, res) => {
	try {
		let {page = 1, limit = 10, category, filter = {}, lang} = req.query;
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

		let brands = await Brands.find({...filter})
			.find(query)
			.skip(skip)
			.limit(limit);

		const total = await Brands.countDocuments(query);

		brands = modifyResponseByLang(brands, lang, [
			"description.history",
			"category.name",
		]);

		const response = paginate(
			page,
			limit,
			total,
			brands,
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
exports.getPopulars = async (req, res) => {
	try {
		// Extract query parameters
		let {page = 1, limit = 10, lang = "en"} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);

		// Fetch popular documents from all collections with proper population
		const [categories, subcategories, innerCategories] = await Promise.all([
			Category.find({"popular.is_popular": true}).lean(),
			Subcategories.find({"popular.is_popular": true})
				.populate("category")
				.lean(),
			InnerCategory.find({"popular.is_popular": true})
				.populate({
					path: "subcategory",
					populate: {
						path: "category",
					},
				})
				.lean(),
		]);

		// Add type and relationship fields to each item
		const categorizedData = [
			...categories.map((item) => ({
				...item,
				type: "category",
			})),
			...subcategories.map((item) => ({
				...item,
				type: "subcategory",
				category: item.category, // Now contains full category data
			})),
			...innerCategories.map((item) => ({
				...item,
				type: "innercategory",
				category: item.subcategory?.category || null, // Now contains full category data
				subcategory: item.subcategory, // Contains full subcategory data
			})),
		];

		// Sort by createdAt in descending order
		categorizedData.sort((a, b) => b.createdAt - a.createdAt);

		// Modify the response for the specified language
		const localizedData = categorizedData.map((item) =>
			modifyResponseByLang(item, lang, ["name", "description"]),
		);

		// Pagination
		const total = localizedData.length;
		const paginatedData = localizedData.slice((page - 1) * limit, page * limit);

		// Prepare the paginated response
		const response = paginate(
			page,
			limit,
			total,
			paginatedData,
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
			"catalogs.name",
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
exports.getShoppingGidById = async (req, res) => {
	try {
		const {lang} = req.query;
		let shoppingGids = await ShoppingGid.findById(req.params.id)
			.populate("brand")
		shoppingGids = modifyResponseByLang(shoppingGids, lang, [
			"name",
			"description",
		]);
		return res.json({
			status: true,
			message: "success",
			data: {
				...shoppingGids,
				quantity: shoppingGids.products.length,
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
exports.getSubcategoriesWithInnerCategories = async (req, res) => {
	try {
		const { lang } = req.query;
		const { categoryId } = req.params;

		// Fetch subcategories with the parent category populated
		const subcategories = await Subcategories.find({ category: categoryId })
			.lean()
			.populate("category");

		// Process each subcategory to include inner categories with category data
		let subcategoriesWithInnerCategories = await Promise.all(
			subcategories.map(async (subcategory) => {
				// Fetch inner categories related to the current subcategory
				const innerCategories = await InnerCategory.find({
					subcategory: subcategory._id,
				})
					.lean()
					.populate("subcategory");

				// Attach category data to each inner category
				const enrichedInnerCategories = innerCategories.map((innerCategory) => ({
					...innerCategory,
					category: subcategory.category, // Add category from parent subcategory
				}));

				return {
					...subcategory,
					innerCategories: enrichedInnerCategories,
				};
			})
		);

		// Modify response based on language
		subcategoriesWithInnerCategories = modifyResponseByLang(
			subcategoriesWithInnerCategories,
			lang,
			["name", "innerCategories.name", "innerCategories.subcategory.name", "innerCategories.category.name"]
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
		let {lang, page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let categories = await InnerCategory.find({
			subcategory: req.params.id,
		})
			.skip(skip)
			.limit(limit);

		const total = await InnerCategory.countDocuments({
			subcategory: req.params.id,
		});

		for (let i = 0; i < categories.length; i++) {
			const innercategoryId = categories[i]._id;

			const productCount = await Products.countDocuments({
				innercategory: innercategoryId,
			});

			const subcategory = await Subcategories.findById(
				categories[i].subcategory,
			);

			categories[i] = categories[i].toObject();
			categories[i].quantity = productCount;
			categories[i].category = subcategory.category;
		}

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
exports.getColors = async (req, res) => {
	try {
		let {lang, page = 1, limit = 10} = req.query;
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
exports.getAllMaterials = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let materials = await Materials.find().skip(skip).limit(limit);
		const total = await Materials.countDocuments();

		materials = modifyResponseByLang(materials, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			materials,
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
exports.getAllCountries = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let countries = await Countries.find().skip(skip).limit(limit);
		const total = await Countries.countDocuments();

		countries = modifyResponseByLang(countries, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			countries,
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
exports.getAllDizayns = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let dizayns = await Dizayns.find().skip(skip).limit(limit);
		const total = await Dizayns.countDocuments();

		dizayns = modifyResponseByLang(dizayns, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			dizayns,
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
exports.getAllPoverxnosts = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let poverxnosts = await Poverxnosts.find().skip(skip).limit(limit);
		const total = await Poverxnosts.countDocuments();

		poverxnosts = modifyResponseByLang(poverxnosts, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			poverxnosts,
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
exports.getAllPrimeneniyas = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let data = await Primeneniyas.find().skip(skip).limit(limit);
		const total = await Primeneniyas.countDocuments();

		data = modifyResponseByLang(data, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			data,
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
exports.getAllNaznacheniyas = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let data = await Naznacheniyas.find().skip(skip).limit(limit);
		const total = await Naznacheniyas.countDocuments();

		data = modifyResponseByLang(data, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			data,
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
exports.getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      filter = {},
      sort,
      order,
      lang,
      not,
      // New query parameters for summary_informations
      gte_guarantee,
      lte_guarantee,
      in_guarantee,
      gte_x,
      lte_x,
      gte_y,
      lte_y,
      gte_z,
      lte_z,
      in_material,
      in_country,
      in_color,
      in_dizayn,
      in_poverxnost,
      in_naznacheniya,
      in_primeneniya,
      in_stil,
			is_have,
			rektifikat,
			gte_price,
			lte_price
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const sortOrder = order === "desc" ? -1 : 1;

    // Handle 'not' filter
    if (not) {
			// Initialize filter["_id"] as an object if it doesn't exist
			filter["_id"] = filter["_id"] || {};
			filter["_id"]["$ne"] = parseFloat(not);
		}
		if (gte_price || lte_price) {
			// Use $or to handle both cases: sale.is_sale = true and sale.is_sale = false
			filter["$or"] = [
				{
					"sale.is_sale": true,
					"sale.price": {
						...(gte_price && { $gte: parseFloat(gte_price) }),
						...(lte_price && { $lte: parseFloat(lte_price) }),
					},
				},
				{
					"sale.is_sale": false,
					price: {
						...(gte_price && { $gte: parseFloat(gte_price) }),
						...(lte_price && { $lte: parseFloat(lte_price) }),
					},
				},
			];
		}

    // Build summary_informations filter dynamically using dot notation
    if (
      gte_guarantee ||
      lte_guarantee ||
      in_guarantee ||
      gte_x ||
      lte_x ||
      gte_y ||
      lte_y ||
      gte_z ||
      lte_z ||
      in_material ||
      in_country ||
      in_color ||
      in_dizayn ||
      in_poverxnost ||
      in_naznacheniya ||
      is_have ||
      in_primeneniya ||
      in_stil ||
			rektifikat !== undefined
    ) {
      // Add guarantee filters
      if (gte_guarantee || lte_guarantee || in_guarantee) {
        filter["summary_informations.guarantee"] = {};
        if (gte_guarantee) filter["summary_informations.guarantee"]["$gte"] = parseFloat(gte_guarantee);
        if (lte_guarantee) filter["summary_informations.guarantee"]["$lte"] = parseFloat(lte_guarantee);
        if (in_guarantee) filter["summary_informations.guarantee"]["$in"] = [parseFloat(in_guarantee)];
      }

      // Add x, y, z filters
      if (gte_x || lte_x) {
        filter["summary_informations.x"] = {};
        if (gte_x) filter["summary_informations.x"]["$gte"] = parseFloat(gte_x);
        if (lte_x) filter["summary_informations.x"]["$lte"] = parseFloat(lte_x);
      }
      if (is_have) {
        filter["summary_informations.is_have"] = is_have;
      }
      if (gte_y || lte_y) {
        filter["summary_informations.y"] = {};
        if (gte_y) filter["summary_informations.y"]["$gte"] = parseFloat(gte_y);
        if (lte_y) filter["summary_informations.y"]["$lte"] = parseFloat(lte_y);
      }
      if (gte_z || lte_z) {
        filter["summary_informations.z"] = {};
        if (gte_z) filter["summary_informations.z"]["$gte"] = parseFloat(gte_z);
        if (lte_z) filter["summary_informations.z"]["$lte"] = parseFloat(lte_z);
      }

      // Add exact match filters
      if (in_material) {
        filter["summary_informations.material"] = { $in: [parseInt(in_material)] };
      }
      if (in_country) {
        filter["summary_informations.country"] = { $in: [parseInt(in_country)] };
      }
      if (in_color) {
        filter["summary_informations.color"] = { $in: [parseInt(in_color)] };
      }
      if (in_dizayn) {
        filter["summary_informations.dizayn"] = { $in: [parseInt(in_dizayn)] };
      }
      if (in_poverxnost) {
        filter["summary_informations.poverxnost"] = { $in: [parseInt(in_poverxnost)] };
      }
      if (in_naznacheniya) {
        filter["summary_informations.naznacheniya"] = { $in: [parseInt(in_naznacheniya)] };
      }
      if (in_primeneniya) {
        filter["summary_informations.primeneniya"] = { $in: [parseInt(in_primeneniya)] };
      }
      if (in_stil) {
        filter["summary_informations.stil"] = { $in: [parseInt(in_stil)] };
      }
			if (rektifikat !== undefined) {
        filter["summary_informations.rektifikat"] = rektifikat === "true"; // Convert string to boolean
      }
    }
		console.log(filter);

    // Query products
    let productQuery = Products.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("category")
      .populate("subcategory")
      .populate("shoppinggid")
      .populate("innercategory")
      .populate("brands")
      .populate("collection")
      .populate("summary_informations.color")
      .populate("summary_informations.material")
      .populate("summary_informations.stil")
      .populate("summary_informations.primeneniya")
      .populate("summary_informations.naznacheniya")
      .populate("summary_informations.poverxnost")
      .populate("summary_informations.dizayn")
      .populate("summary_informations.country")
      .populate("information_uz.key")
      .populate("information_ru.key")
      .populate("information_en.key")
      .populate("solution")
      .populate("comments");

    // Apply sorting
    if (sort === "sales") {
      productQuery = productQuery.sort({ sales: sortOrder });
    } else if (sort === "new") {
      productQuery = productQuery.sort({ createdAt: -1 });
    } else if (sort === "cheap") {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === "expensive") {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sort === "popular") {
      productQuery = productQuery.sort({ sales: 1 });
    }

    // Get liked products
    const likedProducts = await LikedProducts.find({
      user_id: req.user._id,
    }).select("product_id");
    const likedProductIds = likedProducts.map((like) => like.product_id);

    let products = await productQuery;

    // Process products with language and liked status
    products = products.map((product) => {
      const modifiedProduct = modifyResponseByLang(product.toObject(), lang, [
        "name",
        "information",
        "description",
        "shoppinggid.name",
        "shoppinggid.description",
        "summary_informations.color.name",
        "summary_informations.dizayn.name",
        "summary_informations.material.name",
        "summary_informations.stil.name",
        "summary_informations.poverxnost.name",
        "summary_informations.naznacheniya.name",
        "summary_informations.primeneniya.name",
        "innercategory.name",
        "collection.name",
        "subcategory.name",
        "category.name",
      ]);
      modifiedProduct.liked = likedProductIds.includes(product._id);
      modifiedProduct.comments = product.comments || 0;
      return modifiedProduct;
    });

    const total = await Products.countDocuments(filter);
    const response = paginate(page, limit, total, products, req.baseUrl, req.path);
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
exports.getLikedProducts = async (req, res) => {
	try {
		let {page = 1, limit = 10, filter = {}, sort, order, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		const sortOrder = order === "desc" ? -1 : 1;

		const likedProductIds = await LikedProducts.find({
			user_id: req.user._id,
		}).select("product_id");
		const productIds = likedProductIds.map((like) => like.product_id);

		let productQuery = Products.find({...filter, _id: {$in: productIds}});

		if (sort) {
			productQuery = productQuery.sort({[sort]: sortOrder});
		}

		productQuery = productQuery.skip(skip).limit(limit);

		productQuery
			.populate("category")
			.populate("subcategory")
			.populate("innercategory")
			.populate("shoppinggid")
			.populate("brands")
			.populate("collection")
			.populate("summary_informations.color")
			.populate("summary_informations.material")
			.populate("summary_informations.stil")
			.populate("summary_informations.primeneniya")
			.populate("summary_informations.naznacheniya")
			.populate("summary_informations.poverxnost")
			.populate("summary_informations.dizayn")
			.populate("summary_informations.country")
			.populate("information_uz.key")
			.populate("information_ru.key")
			.populate("information_en.key")
			.populate("solution")
			.populate("comments");

		let products = await productQuery;

		products = products.map((product) => {
			const modifiedProduct = modifyResponseByLang(product.toObject(), lang, [
				"name",
				"information",
				"description",
				"innercategory.name",
				"shoppinggid.name",
				"shoppinggid.description",
				"summary_informations.color.name",
				"summary_informations.material.name",
				"summary_informations.poverxnost.name",
				"summary_informations.stil.name",
				"summary_informations.primeneniya.name",
				"summary_informations.dizayn.name",
				"summary_informations.naznacheniya.name",
				"collection.name",
				"subcategory.name",
				"category.name",
			]);
			modifiedProduct.liked = true;
			modifiedProduct.comments = product.comments || 0;
			return modifiedProduct;
		});

		const total = await Products.countDocuments({
			_id: {$in: productIds},
			...filter,
		});
		const response = paginate(
			page,
			limit,
			total,
			products,
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
exports.getAllStils = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let data = await Stils.find().skip(skip).limit(limit);
		const total = await Stils.countDocuments();

		data = modifyResponseByLang(data, lang, ["name"]);

		const response = paginate(
			page,
			limit,
			total,
			data,
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
exports.toggleProductsLike = async (req, res) => {
	try {
		const product = await Products.findById(req.body.product_id);
		if (!product) {
			return res.status(404).json({
				status: false,
				message: "Product not found",
				data: null,
			});
		}
		let likedProduct = await LikedProducts.findOne({
			user_id: req.user._id,
			product_id: product._id,
		});
		if (!likedProduct) {
			likedProduct = await LikedProducts.create({
				user_id: req.user._id,
				product_id: product._id,
			});
			return res.json({
				status: true,
				message: "product liked successfully",
				data: {
					liked: true,
					...likedProduct._doc,
				},
			});
		} else {
			await likedProduct.deleteOne();
			return res.json({
				status: true,
				message: "product unliked successfully",
				data: {
					liked: false,
					...likedProduct._doc,
				},
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};
exports.getProductsById = async (req, res) => {
	try {
		const {lang} = req.query;

		let product = await Products.findById(req.params.id).populate([
			"category",
			"subcategory",
			"innercategory",
			"brands",
			"collection",
			"shoppinggid",
			"information_uz.key",
			"information_ru.key",
			"information_en.key",
			"solution",
			"comments",
			"compare_products"
		]).populate("summary_informations.color")
		.populate("summary_informations.material")
		.populate("summary_informations.stil")
		.populate("summary_informations.primeneniya")
		.populate("summary_informations.naznacheniya")
		.populate("summary_informations.poverxnost")
		.populate("summary_informations.dizayn")
		.populate("summary_informations.country");

		if (!product) {
			return res.status(404).json({
				status: false,
				message: "Product not found",
				data: null,
			});
		}

		const modifiedProduct = modifyResponseByLang(product.toObject(), lang, [
			"name",
			"information",
			"shoppinggid.name",
			"shoppinggid.description",
			"description",
			"summary_informations.color.name",
			"summary_informations.material.name",
			"summary_informations.poverxnost.name",
			"summary_informations.naznacheniya.name",
			"summary_informations.primeneniya.name",
			"summary_informations.stil.name",
			"summary_informations.dizayn.name",
			"innercategory.name",
			"collection.name",
			"subcategory.name",
			"category.name",
		]);

		// Add comments count to the response
		modifiedProduct.comments = product.comments || 0;

		return res.json({
			status: true,
			message: "success",
			data: modifiedProduct,
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
		let {page = 1, limit = 10, filter = {}, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let productQuery = Inspiration.find({...filter})
			.skip(skip)
			.limit(limit);

		let products = await productQuery;

		const total = await Collections.countDocuments({...filter});
		products = modifyResponseByLang(products, lang, [
			"description.text",
			"title",
		]);
		const response = paginate(
			page,
			limit,
			total,
			products,
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
exports.getSolutions = async (req, res) => {
	try {
		let {page = 1, limit = 10, filter = {}, lang} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let productQuery = Solutions.find({...filter})
			.skip(skip)
			.limit(limit)
			.populate("brand");

		let products = await productQuery;

		const total = await Solutions.countDocuments({...filter});

		products = modifyResponseByLang(products, lang, ["name"]);
		const response = paginate(
			page,
			limit,
			total,
			products,
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
exports.getinspirationById = async (req, res) => {
	try {
		let {lang} = req.query;

		let inspiration = await Collections.findById(req.params.id);

		if (!inspiration) {
			return res.status(404).json({
				status: false,
				message: "Inspiration not found",
			});
		}

		inspiration = modifyResponseByLang(inspiration, lang, [
			"description.text",
			"title",
			"products.name",
			"products.information",
			"products.description",
		]);

		return res.json({
			status: true,
			message: "success",
			data: inspiration,
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
exports.getMaxBalance = async (req, res) => {
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
function numberFormat(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
async function getContractId() {
  try {
    // Find the counter document
    let counter = await Counter.findOne({
      model: "contract",
      field: "contract",
    });

    if (!counter) {
      // If no document exists, create a new one
      counter = await Counter.create({
        model: "contract",
        field: "contract",
				count: 0
      });

    }

		counter.count++;
		await counter.save();

    return counter.count;
  } catch (error) {
    console.error("Error fetching or creating counter:", error);
    throw error;
  }
}
exports.getOrderListInFile = async (req, res) => {
	try {
		// Extract products from request body
		const {products, sale = 0} = req.body;

		// Fetch products from the database based on IDs
		const productIds = products.map((item) => item.id);
		const dbProducts = await Products.find({_id: {$in: productIds}});

		if (!dbProducts.length) {
			return res.status(404).json({
				status: false,
				message: "No products found.",
			});
		}

		const contractId = await getContractId()

		// Process each product
		const tableData = products.map((item) => {
			const product = dbProducts.find(
				(p) => p._id.toString() === item.id.toString(),
			);

			return {
				photo: product.photo_urls[0]?.url || "", // Use the first photo URL
				name: product.name_ru || "", // Use the name in Russian
				quantity: item.quantity || 0,
				salePrice: product.sale.is_sale ? product.sale.price : "", // Sale price if on sale
				notSalePrice: !product.sale.is_sale ? product.price : "", // Regular price if not on sale
				price: product.sale.is_sale ? product.sale.price : product.price, // Actual price
				total:
					item.quantity *
					(product.sale.is_sale ? product.sale.price : product.price), // Total cost
				deliveryDay: product.delivery.day || 0, // Delivery day
			};
		});

		// Calculate totals
		const totalQuantity = tableData.reduce(
			(sum, item) => sum + item.quantity,
			0,
		);
		const totalAmount = tableData.reduce((sum, item) => sum + item.total, 0);

		// Generate the PDF
		const publicDir = path.join("..", "public");
		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir, {recursive: true});
		}

		// Generate the PDF
		const doc = new PDFDocument();
		let pdfFileName = `order_list_${Date.now()}.pdf`;
		let pdfPath = path.join(publicDir, pdfFileName);
		pdfPath = path.join(__dirname, "..", "cdn", "public", pdfPath);
		doc.registerFont("Inter-Thin", "fonts/Inter_24pt-Thin.ttf");
		doc.registerFont("Inter-Bold", "fonts/Inter_24pt-Bold.ttf");
		doc.registerFont("Inter-Medium", "fonts/Inter_18pt-Medium.ttf");
		doc.font("Inter-Medium");

		// Save the PDF to a file
		doc.pipe(fs.createWriteStream(pdfPath));

		//logo
		const {visitedRoutes, ...user} = req.user._doc;
		const logoImage = user.photo_url ? await fetchImageBuffer(user.photo_url) : null;

			// Add photo if available
			if (logoImage) {
				doc.image(logoImage, 0, 0, {
					width: 70,
					height: 70,
				});
			}

			const now = new Date();

// Format the current date
		const formattedDate = `${String(now.getDate()).padStart(2, "0")}-${String(
			now.getMonth() + 1,
		).padStart(2, "0")}-${now.getFullYear()}`;

		// Calculate the date 30 days from now
		const validUntil = new Date(now);
		validUntil.setDate(validUntil.getDate() + 30); // Add 30 days

		const formattedValidUntil = `${String(validUntil.getDate()).padStart(2, "0")}-${String(
			validUntil.getMonth() + 1,
		).padStart(2, "0")}-${validUntil.getFullYear()}`;

		// Title
		doc.fontSize(10).text(`КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ №${contractId}`, { align: "center" });
		doc.moveDown();
		doc.fontSize(10).text(`Дата: ${formattedDate}`, 40);
		doc.moveDown();
		doc.fontSize(10).text(`Действительно до: ${formattedValidUntil}`, 40);
		doc.moveDown();
		doc.fontSize(10).text(`Уважаемый ${req.body.client_name},`, 40);
		doc.moveDown();
		doc.fontSize(10).text(`Мы рады представить подборку материалов и предметов интерьера для Вашего проекта. Каждая позиция тщательно подобрана, чтобы создать гармоничное и функциональное пространство, полностью отвечающее Вашим потребностям.`, 40);
		doc.moveDown();
		
		doc.font("Inter-Bold");
		doc.fontSize(10).text(`СПЕЦИФИКАЦИЯ`, 40);
		doc.moveDown();
		doc.font("Inter-Thin");


		// Table headers
		const headers = [
			"Фото",
			"Имя",
			"Количество",
			"Цена со скидкой",
			"Цена без скидки",
			"Цена",
			"Доставка",
		];
		const startX = 40;
		const startY = 250;
		const columnWidths = [40, 80, 80, 80, 80, 80, 80];
		let currentY = startY;
		const pageWidth = doc.page.width;

		// Draw headers
		headers.forEach((header, index) => {
			doc
				.fillColor("#3c3d3c") // Set text color
				.fontSize(7)
				.text(
					header,
					startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
					currentY,
					{
						width: columnWidths[index],
						align: "center",
					},
				);
		});
		currentY += 30; // Move down after the header
		doc
			.strokeColor("#F6F6F6") // Set line color
			.moveTo(0, 115) // Starting point (left edge)
			.lineTo(pageWidth, 115) // Ending point (right edge)
			.stroke();

		doc.fillColor("#000");
		doc.font("Inter-Medium");

		// Fetch and add table rows
		for (const row of tableData) {
			const imageBuffer = row.photo ? await fetchImageBuffer(row.photo[0].url) : null;

			// Add photo if available
			if (imageBuffer) {
				doc.image(imageBuffer, startX, currentY, {
					width: columnWidths[0],
					height: 40,
				});
			}

			// Add other fields (name, quantity, prices, etc.)
			doc.text(row.name, startX + columnWidths[0] + 20, currentY + 10, {
				width: columnWidths[1],
				align: "left",
			});
			doc.text(
				numberFormat(row.quantity),
				startX + columnWidths[0] + columnWidths[1] + 5,
				currentY + 10,
				{
					width: columnWidths[2],
					align: "center",
				},
			);
			doc.text(
				row.salePrice ? `${numberFormat(row.salePrice)} сум` : "-",
				startX + columnWidths[0] + columnWidths[1] + columnWidths[2] + 5,
				currentY + 10,
				{
					width: columnWidths[3],
					align: "center",
				},
			);
			doc.text(
				row.notSalePrice ? `${numberFormat(row.notSalePrice)} сум` : "-",
				startX +
					columnWidths[0] +
					columnWidths[1] +
					columnWidths[2] +
					columnWidths[3] +
					5,
				currentY + 10,
				{
					width: columnWidths[4],
					align: "center",
				},
			);
			doc.text(
				`${numberFormat(row.total)} сум`,
				startX +
					columnWidths[0] +
					columnWidths[1] +
					columnWidths[2] +
					columnWidths[3] +
					columnWidths[4] +
					5,
				currentY + 10,
				{
					width: columnWidths[5],
					align: "center",
				},
			);
			doc.text(
				row.deliveryDay,
				startX +
					columnWidths[0] +
					columnWidths[1] +
					columnWidths[2] +
					columnWidths[3] +
					columnWidths[4] +
					columnWidths[5] +
					5,
				currentY + 10,
				{
					width: columnWidths[6],
					align: "center",
				},
			);

			currentY += 70; // Move down after each row
			doc
				.strokeColor("#F6F6F6") // Set line color
				.moveTo(0, currentY - 20) // Starting point (left edge)
				.lineTo(pageWidth, currentY - 20) // Ending point (right edge)
				.stroke();
		}

		doc.moveDown();

		// Helper function for centered styled text with background
		function drawStyledTextCentered(doc, label, value, currentY) {
			const pageWidth = doc.page.width; // Get the page width
			const textBackgroundWidth = 300; // Total width of the background
			const textBackgroundHeight = 20; // Height of the text background

			// Calculate X position to center the background
			const textBackgroundX = (pageWidth - textBackgroundWidth) / 2;
			const textBackgroundY = currentY; // Y position

			// Save current graphics state
			doc.save();

			// Draw the background rectangle with rounded corners
			doc
				.fillColor("#FAFAFA") // Background color
				.roundedRect(
					textBackgroundX,
					textBackgroundY,
					textBackgroundWidth,
					textBackgroundHeight,
					5,
				)
				.fill();

			// Restore text settings
			doc.restore();

			// Add the label on the left
			doc
				.fillColor("#000000") // Text color
				.fontSize(10)
				.text(label, textBackgroundX + 10, textBackgroundY + 5, {
					width: textBackgroundWidth - 100, // Make sure there's enough space for the value
					align: "left",
				});

			// Add the value on the right side
			doc
				.fontSize(10)
				.text(
					value,
					textBackgroundX + textBackgroundWidth - 100,
					textBackgroundY + 5,
					{
						width: 100, // Fixed width for the value part
						align: "right",
					},
				);

			// Update Y position for the next line
			return currentY + textBackgroundHeight + 2;
		}

		// Start drawing each centered styled text block
		currentY = drawStyledTextCentered(
			doc,
			`Общее количество продуктов:`,
			`${totalQuantity}`,
			currentY,
		);
		currentY = drawStyledTextCentered(
			doc,
			`Общая сумма:`,
			`${numberFormat(totalAmount)} сум`,
			currentY,
		);
		currentY = drawStyledTextCentered(
			doc,
			`Скидка:`,
			`${numberFormat(sale)} сум`,
			currentY,
		);
		currentY = drawStyledTextCentered(
			doc,
			`Общая сумма со скидкой:`,
			`${numberFormat(totalAmount - sale)} сум`,
			currentY,
		);

		doc.moveDown();
		doc.font("Inter-Medium");
		doc.fontSize(10).text(`Условия:`, 40);
		doc.moveDown();
		doc.fontSize(10).text(`1. Срок действия цен: 30 дней`, 60);
		doc.fontSize(10).text(`2. Условия оплаты: 70% предоплата, 30% перед отгрузкой`, 60);
		doc.fontSize(10).text(`3. Доставка согласовывается отдельно для каждой позиции`, 60);
		doc.moveDown();
		doc.fontSize(10).text(`Тел: ${user.phone_number} Email: ${user.email}`, 40);
		doc.moveDown();
		doc.fontSize(10).text(`Примечания:`, 40);
		doc.moveDown();
		doc.fontSize(10).text(`• Цены указаны в сумах`, 60);
		doc.fontSize(10).text(`• Сроки поставки указаны с момента внесения предоплаты`, 60);
		doc.fontSize(10).text(`• Изображения товаров могут незначительно отличаться от оригинала`, 60);

		doc.end();
		return res.json({
			status: true,
			message: "success",
			data: {
				url: `${process.env.SITE_URL}${pdfFileName}`,
				// url: `http://localhost:3001/${pdfFileName}`,
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

// Helper to fetch and convert image
const fetchImageBuffer = async (url) => {
	try {
		const response = await axios.get(url, {responseType: "arraybuffer"});
		const webpBuffer = Buffer.from(response.data, "binary");

		// Convert WebP to PNG
		return await sharp(webpBuffer).png().toBuffer();
	} catch (err) {
		console.error("Error fetching or converting image:", err);
		return null;
	}
};
exports.createOrder = async (req, res) => {
	try {
		const newOrder = new Orders({
			user: req.user._id,
			bonus: req.body.bonus,
			buyer: {
				project_name: req.body.buyer.project_name,
				name: req.body.buyer.name,
				surname: req.body.buyer.surname,
				phone_number: req.body.buyer.phone_number,
				email: req.body.buyer.email,
			},
			communication: {
				full_name: req.body.communication.full_name,
				email: req.body.communication.email,
				phone_number: req.body.communication.phone_number,
				comment: req.body.communication.comment,
			},
			delivery: {
				type: req.body.delivery.type,
				address: req.body.delivery.address,
				kv: req.body.delivery.kv,
				pd: req.body.delivery.pd,
				is_private_house: req.body.delivery.is_private_house,
			},
			pay: {
				type: req.body.pay.type,
			},
			products: req.body.products,
		});
		await newOrder.save();
		if (req.body.pay.type == "card") {
			let totalAmount = 0;
			const validProducts = [];

			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				if (productDoc) {
					let productQuantity = product.quantity;

					// Check if the requested quantity is higher than available stock
					if (productQuantity > productDoc.quantity) {
						productQuantity = productDoc.quantity;
					}

					const price = productDoc.sale.isSale
						? productDoc.sale.price
						: productDoc.price;
					const subtotal = price * productQuantity;
					totalAmount += subtotal;

					// Update product details with adjusted quantity and prices
					validProducts.push({
						product: product.product,
						quantity: productQuantity,
						price: price,
						initial_price: productDoc.initial_price || 0,
					});
				}
			}

			// Update the order with valid products only
			newOrder.products = validProducts;

			// If no valid products remain in the order, return an error response
			if (validProducts.length === 0) {
				return res.status(400).json({error: "No valid products in order."});
			}
			const {token} = await getMulticardToken();
			const agent = new https.Agent({
				rejectUnauthorized: false,
			});
			const response = await axios.post(
				process.env.MULTICARD_CONNECTION_API + "/payment",
				{
					card: {
						token: req.body.pay.card.token,
					},
					amount: totalAmount * 100,
					store_id: process.env.MULTICARD_STORE_ID,
					invoice_id: newOrder._id,
					details: "",
				},
				{
					httpsAgent: agent,
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			newOrder.pay.card.card_pan = response.data.data.card_pan;
			newOrder.pay.card.uuid = response.data.data.uuid;
			newOrder.pay.card.payment_amount = response.data.data.payment_amount;
			newOrder.pay.card.total_amount = response.data.data.total_amount;
			newOrder.pay.card.commission_amount =
				response.data.data.commission_amount;
			await newOrder.save();

			return res.json({
				success: true,
				data: newOrder,
			});
		}
		if (req.body.pay.type == "uzum") {
			newOrder.pay.order_url =
				"https://www.apelsin.uz/open-service?serviceId=498616071&order_id=" +
				newOrder.order_id;
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				const price = productDoc.sale.isSale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
				product.initial_price = productDoc.initial_price || 0;
			}
		}
		if (req.body.pay.type == "payme") {
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				if (!productDoc) {
					return res.json({error: "Product not found"});
				}
				const price = productDoc.sale.is_sale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
				// product.initial_price = productDoc.initial_price || 0;
			}
			const stringToEncode = `m=65e2f91cf4193eeca0afd4b0;ac.order_id=${
				newOrder._id
			};a=${totalAmount * 100}`;

			const base64EncodedString =
				Buffer.from(stringToEncode).toString("base64");
			newOrder.pay.order_url =
				"https://checkout.paycom.uz/" + base64EncodedString;
		}
		if (req.body.pay.type == "click") {
			let totalAmount = 0;
			for (const product of newOrder.products) {
				const productDoc = await Products.findById(product.product);
				if (!productDoc) {
					return res.json({error: "Product not found"});
				}
				const price = productDoc.sale.isSale
					? productDoc.sale.price
					: productDoc.price;
				const subtotal = price * product.quantity;
				totalAmount += subtotal;
				product.price = price;
				product.initial_price = productDoc.initial_price || 0;
			}
			newOrder.pay.order_url = `https://my.click.uz/services/pay?service_id=33923&merchant_id=25959&amount=${totalAmount}&transaction_param=${newOrder.order_id}`;
		}
		await newOrder.save();

		return res.json({
			status: "success",
			data: newOrder,
		});
	} catch (error) {
		console.error(error);
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

		let orders = await Orders.find({...filter, user: req.user._id})
			.skip(skip)
			.limit(limit)
			.populate("user")
			.populate("products.product")
			.populate("products.color");
		const total = await Orders.countDocuments({...filter, user: req.user._id});
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
		let {lang} = req.query;
		let order = await Orders.findById(req.params.id)
			.populate("user")
			.populate("products.product")
			.populate("products.color");
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
exports.getAllComments = async (req, res) => {
	try {
		let {page = 1, limit = 10, lang, filter = {}} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;

		let comments = await Comments.find({...filter})
			.skip(skip)
			.limit(limit)
			.populate("user");
		const total = await Comments.countDocuments({...filter});

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
exports.createCommentForProduct = async (req, res) => {
	try {
		const comment = await Comments.create({
			...req.body,
			user: req.user._id,
		});
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
exports.createWithdraws = async (req, res) => {
	try {
		console.log(req.user);
		if (req.user.balance < req.body.amount) {
			return res.status(500).json({
				status: false,
				message: "Not enough balance",
			});
		}
		const comment = await Withdraws.create({
			...req.body,
			user: req.user._id,
		});

		req.user.balance -= req.body.amount;
		await req.user.save();
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
