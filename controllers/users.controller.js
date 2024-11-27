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
		const user = await Users.findById(req.user._id).populate("direction");
		let {password, ...result} = user._doc;
		result = modifyResponseByLang(result, lang, ["direction.name"]);
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
			.populate("solution")
			.limit(limit);
		products = modifyResponseByLang(products, lang, [
			"name",
			"information",
			"description",
			"innercategory.name",
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
			.populate("products");
		shoppingGids = modifyResponseByLang(shoppingGids, lang, [
			"name",
			"description",
			"products.name",
			"products.information",
			"products.description",
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

exports.getProducts = async (req, res) => {
	try {
		let {
			page = 1,
			limit = 10,
			filter = {},
			sort,
			order,
			lang,
			delivery_day_gte,
			delivery_day_lte,
			amount_gte,
			amount_lte,
			color,
		} = req.query;

		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		const sortOrder = order === "desc" ? -1 : 1;

		if (delivery_day_gte || delivery_day_lte) {
			filter["delivery.day"] = {};
			if (delivery_day_gte)
				filter["delivery.day"].$gte = parseInt(delivery_day_gte);
			if (delivery_day_lte)
				filter["delivery.day"].$lte = parseInt(delivery_day_lte);
		}

		if (amount_gte || amount_lte) {
			filter["price"] = {};
			if (amount_gte) filter["price"].$gte = parseInt(amount_gte);
			if (amount_lte) filter["price"].$lte = parseInt(amount_lte);
		}

		if (color) {
			filter["photo_urls.color"] = color;
		}

		let productQuery = Products.find(filter)
			.skip(skip)
			.limit(limit)
			.populate("category")
			.populate("subcategory")
			.populate("innercategory")
			.populate("brands")
			.populate("photo_urls.color")
			.populate("solution");

		if (sort === "sales") {
			productQuery = productQuery.sort({sales: sortOrder});
		} else if (sort === "new") {
			productQuery = productQuery.sort({createdAt: -1});
		} else if (sort === "cheap") {
			productQuery = productQuery.sort({price: 1});
		} else if (sort === "expensive") {
			productQuery = productQuery.sort({price: -1});
		} else if (sort === "popular") {
			productQuery = productQuery.sort({sales: 1});
		}

		const likedProducts = await LikedProducts.find({
			user_id: req.user._id,
		}).select("product_id");
		const likedProductIds = likedProducts.map((like) => like.product_id);

		let products = await productQuery;

		products = products.map((product) => {
			const modifiedProduct = modifyResponseByLang(product.toObject(), lang, [
				"name",
				"information",
				"description",
				"innercategory.name",
				"subcategory.name",
				"category.name",
			]);

			modifiedProduct.liked = likedProductIds.includes(product._id);

			return modifiedProduct;
		});

		const total = await Products.countDocuments(filter);
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
			.populate("brands")
			.populate("photo_urls.color")
			.populate("solution");

		let products = await productQuery;

		products = products.map((product) => {
			const modifiedProduct = modifyResponseByLang(product.toObject(), lang, [
				"name",
				"information",
				"description",
				"innercategory.name",
				"subcategory.name",
				"category.name",
			]);
			modifiedProduct.liked = true;
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
		let product = await Products.findById(req.params.id)
			.populate("category")
			.populate("subcategory")
			.populate("innercategory")
			.populate("photo_urls.color")
			.populate("brands")
			.populate("solution");
		if (!product) {
			return res.status(404).json({
				status: false,
				message: "Product not found",
				data: null,
			});
		}
		product = modifyResponseByLang(product, lang, [
			"name",
			"information",
			"description",
			"innercategory.name",
			"subcategory.name",
			"category.name",
			"solution.name",
		]);
		return res.json({
			status: true,
			message: "success",
			data: product,
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

		let inspiration = await Collections.findById(req.params.id).populate(
			"products",
		);

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
