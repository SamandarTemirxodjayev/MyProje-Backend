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
		const directions = await Directions.find();
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
		const advantages = await Advantages.find();
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
exports.getCategories = async (req, res) => {
	try {
		let {page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		const categories = await Category.find().skip(skip).limit(limit);
		const total = await Category.countDocuments();
		const totalPages = Math.ceil(total / limit);
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
	const filePath = path.join(__dirname, "../database", `usage-rules.json`);
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
