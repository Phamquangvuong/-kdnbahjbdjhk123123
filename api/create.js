const redis = require("../lib/redis");

module.exports = async (req, res) => {
  const amount = Number(req.query.nap);

  if (!amount) return res.json({ error: "invalid amount" });

  const note = "nap" + Date.now();

  await redis.set("pay:" + note, {
    note,
    amount,
    status: "pending",
    expire: Date.now() + 120000
  });

  res.json({
    qr: `https://img.vietqr.io/image/MB-0975868667-compact2.png?amount=${amount}&addInfo=${note}`,
    note
  });
};
