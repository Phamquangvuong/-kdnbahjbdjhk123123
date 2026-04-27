const redis = require("../lib/redis");

const EXPIRE = 2 * 60 * 1000;
const LIMIT_TIME = 10; // 10s

module.exports = async (req, res) => {
  try {
    const amount = Number(req.query.nap);

    if (!amount || amount <= 0) {
      return res.json({ error: "invalid amount" });
    }

    // 📍 LẤY IP
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "unknown";

    // 🚫 RATE LIMIT
    const key = `limit:${ip}`;
    const count = await redis.get(key) || 0;

    if (count >= 3) {
      return res.json({
        error: "too many requests",
        wait: "10s"
      });
    }

    await redis.set(key, count + 1, { ex: LIMIT_TIME });

    // 💳 tạo bill
    const note = "nap" + Date.now();

    const data = {
      note,
      amount,
      status: "pending",
      createdAt: Date.now(),
      expireAt: Date.now() + EXPIRE
    };

    await redis.set(`pay:${note}`, data, { ex: 180 });

    res.json({
      qr: `https://img.vietqr.io/image/MB-0975868667-compact2.png?amount=${amount}&addInfo=${note}`,
      note,
      expire: "2 phút"
    });

  } catch (e) {
    res.json({ error: e.message });
  }
};
