const EXPIRE_TIME = 2 * 60 * 1000; // 2 phút

module.exports = async (req, res) => {
  const amount = Number(req.query.amount);
  if (!amount) return res.json({ error: "invalid amount" });

  const note = "nap" + Date.now();

  const data = {
    note,
    amount,
    status: "pending",
    createdAt: Date.now(),
    expireAt: Date.now() + EXPIRE_TIME
  };

  await redis.set(`pay:${note}`, data, { ex: 180 }); // TTL Redis

  res.json({
    qr: `https://img.vietqr.io/image/MB-0975868667-compact2.png?amount=${amount}&addInfo=${note}`,
    note,
    expireAt: data.expireAt
  });
};
