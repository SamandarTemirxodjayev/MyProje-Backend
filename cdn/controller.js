const path = require("path");
const multer = require("multer");
const Files = require("./models/Files");
const {default: mongoose} = require("mongoose");
const dotenv = require("dotenv");
const sharp = require("sharp");
const fs = require("fs");

dotenv.config();

exports.index = async (req, res) => {
	res.json({message: "Storage", version: "1.0.0"});
};
exports.upload = async (req, res) => {
	try {
		const publicFolderPath = `./cdn/public/`;

		const storage = multer.diskStorage({
			destination: publicFolderPath,
			filename: (req, file, cb) => {
				const fileId = new mongoose.Types.ObjectId();
				const fileExtension = path.extname(file.originalname);
				const fileName = `${fileId}${fileExtension}`;
				cb(null, fileName);
			},
		});

		const upload = multer({storage}).single("file");

		upload(req, res, async (err) => {
			if (err) {
				console.error("Error handling file upload:", err);
				return res.status(500).json({message: "Error uploading the file"});
			}

			if (!req.file) {
				return res.status(400).json({message: "No file provided"});
			}

			const fileOriginalPath = path.join(publicFolderPath, req.file.filename);
			const fileId = path.basename(
				req.file.filename,
				path.extname(req.file.filename),
			);

			const {size, format} = req.query;

			if (req.file.mimetype.startsWith("image/")) {
				if (size && format) {
					const sizes = ["small", "medium", "large"];
					const formats = ["jpg", "png", "webp"];
					const sizeDimensions = {
						small: 150,
						medium: 500,
						large: 1000,
					};

					const fileUrls = {};

					for (const sizeKey of sizes) {
						const sizeFolder = path.join(publicFolderPath, sizeKey);
						if (!fs.existsSync(sizeFolder)) {
							fs.mkdirSync(sizeFolder, {recursive: true});
						}

						if (sizeKey === size) {
							fileUrls[sizeKey] = {}; // Initialize nested object for each size
							for (const formatKey of formats) {
								if (formatKey === format) {
									const outputFileName = `${fileId}.${formatKey}`;
									const outputPath = path.join(sizeFolder, outputFileName);

									await sharp(fileOriginalPath)
										.resize(sizeDimensions[sizeKey])
										.toFormat(formatKey)
										.toFile(outputPath);

									fileUrls[sizeKey][
										formatKey
									] = `${process.env.SITE_URL}${sizeKey}/${outputFileName}`;
								}
							}
						}
					}

					const files = await Files.create({
						file_name: req.file.filename,
						file_id: fileId,
						file_urls: fileUrls, // Save as nested object with size and format
						admin_id: req.admin ? req.admin._id : null,
					});

					await files.save();

					return res.status(200).json({
						message: "File uploaded and processed successfully",
						status: 200,
						data: {
							file_name: req.file.filename,
							file_id: fileId,
							file_url: fileUrls[size][format] || fileUrls[size],
							createdAt: files.createdAt,
							_id: files._id,
						},
					});
				} else {
					const fileUrl = `${process.env.SITE_URL}${req.file.filename}`;

					const files = await Files.create({
						file_name: req.file.filename,
						file_id: fileId,
						file_urls: {
							original: fileUrl,
						},
						admin_id: req.admin ? req.admin._id : null,
					});

					await files.save();

					return res.status(200).json({
						message: "File uploaded successfully",
						status: 200,
						data: {
							createdAt: files.createdAt,
							fileId: files.file_id,
							fileName: files.file_name,
							fileUrl: fileUrl,
							_id: files._id,
						},
					});
				}
			} else {
				const fileUrl = `${process.env.SITE_URL}${req.file.filename}`;
				const files = await Files.create({
					file_name: req.file.filename,
					file_id: fileId,
					file_urls: {
						original: fileUrl,
					},
					admin_id: req.admin ? req.admin._id : null,
				});

				await files.save();

				return res.status(200).json({
					message: "File uploaded successfully",
					status: 200,
					data: {
						createdAt: files.createdAt,
						fileId: files.file_id,
						fileName: files.file_name,
						fileUrl: fileUrl,
						_id: files._id,
					},
				});
			}
		});
	} catch (error) {
		console.error("Error in file upload:", error);
		return res.status(500).json({message: error.message});
	}
};
