const nodemailer = require("nodemailer");

exports.sendEmail = async (to, html, text) => {
	const transporter = nodemailer.createTransport({
		service: "Gmail",
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: "uchunabu@gmail.com",
			pass: "wzyt wxhy ickj bacy",
		},
	});

	await transporter.sendMail({
		from: "HyperNova",
		to: to,
		subject: "Tasdiqlash kodi",
		text,
		html,
	});
};
