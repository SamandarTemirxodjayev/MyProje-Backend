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
		let users;
		if (req.query.status == 0) {
			users = await Users.find({
				is_submit: false,
			});
		} else if (req.query.status == 1) {
			users = await Users.find({
				is_submit: true,
			});
		} else if (req.query.status == 2) {
			users = await Users.find();
		} else {
			users = [];
		}
		return res.json({
			status: true,
			message: "success",
			data: users,
		});
	} catch (error) {
		console.log(error);
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
exports.getDirectionById = async (req, res) => {
	try {
		const direction = await Directions.findById(req.params.id);
		if (!direction) {
			return res.status(400).json({
				status: false,
				message: "directions not found",
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
exports.getAdvantagesById = async (req, res) => {
	try {
		const advantage = await Advantages.findById(req.params.id);
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
		const category = await Category.create(req.body);
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
		const categories = await Category.find();
		return res.json({
			status: true,
			message: "success",
			data: categories,
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
		const category = await Category.findById(req.params.id);
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
		const subcategory = await Subcategories.find();
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
exports.getSubCategoryById = async (req, res) => {
	try {
		const subcategory = await Subcategories.findById(req.params.id);
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
		const innercategory = await InnerCategory.find().populate("subcategory");
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
exports.getInnerCategoryById = async (req, res) => {
	try {
		const innercategory = await InnerCategory.findById(req.params.id).populate(
			"subcategory",
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
exports.getInnerCategoriesGetByCategoriesId = async (req, res) => {
	try {
		const innercategory = await InnerCategory.find({
			subcategory: req.params.id,
		});
		if (!innercategory) {
			return res.status(400).json({
				status: false,
				message: "innercategories not found",
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
		const brands = await Brands.find().populate("category");
		return res.json({
			status: true,
			message: "success",
			data: brands,
		});
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
		const brand = await Brands.findById(req.params.id).populate("category");
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
exports.updateUsage = async (req, res) => {
	const filePath = path.join(__dirname, "../database", `usage-rules.json`);

	try {
		// Read the existing usage rules
		let fileContent = await fs.readFile(filePath, "utf8");
		let usageRules = JSON.parse(fileContent);

		// Extract the updated rule from the request body
		const {rule} = req.body;

		// Generate the updatedAt timestamp from the backend
		const updatedAt = Date.now(); // Get the current timestamp

		// Find the index of the rule to update (assuming there's one rule)
		if (usageRules.length > 0) {
			usageRules[0] = {rule, updatedAt}; // Replace the first (and only) rule
		} else {
			// If no rules exist, add the new one
			usageRules.push({rule, updatedAt});
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
exports.updateLinks = async (req, res) => {
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
		const shoppingGid = await ShoppingGid.find().populate("brand");
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
exports.getActiveLimitedShoppingGids = async (req, res) => {
	try {
		const shoppingGid = await ShoppingGid.findActiveLimited(
			req.params.limit,
		).populate("brand");
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
		const shoppingGid = await ShoppingGid.findById(req.params.id);
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
