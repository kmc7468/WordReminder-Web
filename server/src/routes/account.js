const bcrypt = require("bcrypt");
const express = require("express");
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
			if (user !== null) { // 같은 username을 가진 사용자가 있는지 확인
				console.log(`[AccountDB] register call failed: Already used username`);

				return { success: false, data: "Already used username" };
			}

			const newUser = new AccountModel({ username, password });
			const result = await newUser.save();

			return { success: true };
		} catch (e) {
			console.log(`[AccountDB] register call failed: DB Error - ${ e }`);

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
		const hash = bcrypt.hashSync(password, salt);

		const result = await accountDBInst.register(username, hash);

		if (result.success) return res.status(200).json({});
		else return res.status(500).json({ error: result.data });
	} catch (e) {
		console.log(`[AccountRouter] register call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

module.exports = router;