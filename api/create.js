const redis = require("../lib/db");

module.exports = async (req, res) => {
  const amount = Number(req.query.amount);

  if (!amount) return res.json({ error: "invalid amount" });

  const note = "nap" + Date.now();

  await redis.set(`pay:${note}`, {
    note,
    amount,
    status: "pending",
    createdAt: Date.now()
  }, { ex: 600 });

  res.json({
    qr: `https://img.vietqr.io/image/MB-0975868667-compact2.png?amount=${amount}&addInfo=${note}`,
    note
  });
};
