const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");

const AccountModel = require("../models/account");

const router = express.Router();

class AccountDB {
	static _inst_;
	static getInst = () => {
		if (!AccountDB._inst_) {
			AccountDB._inst_ = new AccountDB();
		}

		return AccountDB._inst_;
	};

	constructor() {
		console.log("[AccountDB] DB initialization complete!")
	};

	register = async (username, password) => {
		try {
			const user = await AccountModel.findOne({ username });
			if (user !== null) return { success: false, data: "Already used username" }; // 계정 중복 확인

			const newUser = new AccountModel({ username, password }); // password는 해싱되어 있어야 함
			await newUser.save(); // TODO: 예외 처리 안됨

			return { success: true };
		} catch (e) {
			console.log(`[AccountDB] register call failed: DB Error - ${ e }`);

			return { success: false, data: "DB Error" };
		}
	};

	login = async (username, password) => {
		try {
			const user = await AccountModel.findOne({ username });
			if (user === null) return { success: false, data: "Nonexist username" };

			const result = bcrypt.compareSync(password, user.password);
			if (!result) return { success: false, data: "Incorrect password" };

			user.token = jwt.sign(user._id.toHexString(), "secretToken");
			await user.save(); // TODO: 예외 처리 안됨

			return { success: true, token: user.token };
		} catch (e) {
			console.log(`[AccountDB] login call failed: DB Error - ${ e }`);

			return { success: false, data: "DB Error" };
		}
	};

	loginByToken = async (token) => {
		try {
			const id = jwt.verify(token, "secretToken");
			const user = await AccountModel.findOne({ _id: id });

			if (user) return { success: true, data: user };
			else return { success: false, data: "Invalid token" };
		} catch (e) {
			console.log(`[AccountDB] loginByToken call failed: DB Error - ${ e }`);

			return { success: false, data: "DB Error" };
		}
	};
};

const accountDBInst = AccountDB.getInst();

router.post("/register", async (req, res) => {
	try {
		const username = req.body.username;
		if (!username || username.length === 0) {
			console.log("[AccountRouter] register call failed: Empty username");

			return res.status(500).json({ error: "Empty username" });
		}

		const password = req.body.password;
		if (!password || password.length === 0) {
			console.log("[AccountRouter] register call failed: Empty password");

			return res.status(500).json({ error: "Empty password" });
		}

		const saltRounds = 10;
		const salt = bcrypt.genSaltSync(saltRounds);
		const hash = bcrypt.hashSync(password, salt); // 비밀번호 해싱

		const result = await accountDBInst.register(username, hash);

		if (result.success) return res.status(200).json({});
		else return res.status(500).json({ error: result.data });
	} catch (e) {
		console.log(`[AccountRouter] register call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.post("/login", async (req, res) => {
	try {
		const username = req.body.username;
		if (!username || username.length === 0) {
			console.log("[AccountRouter] login call failed: Empty username");

			return res.status(500).json({ error: "Empty username" });
		}

		const password = req.body.password;
		if (!password || password.length === 0) {
			console.log("[AccountRouter] login call failed: Empty password");

			return res.status(500).json({ error: "Empty password" });
		}

		const result = await accountDBInst.login(username, password);

		if (result.success) return res.cookie("x_auth", result.token).status(200).json({});
		else return res.status(500).json({ error: result.data });
	} catch (e) {
		console.log(`[AccountRouter] login call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

module.exports = { router, accountDBInst };