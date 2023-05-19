const AccountModel = require("../routes/account");

const accountMiddleware = async (req, res, next) => {
	const token = req.cookies.x_auth;
	const result = await AccountModel.accountDBInst.loginByToken(token);
	if (result.success) {
		next();
	} else {
		res.status(401).json({ error: "Not loggged in" });
	}
};

module.exports = accountMiddleware;