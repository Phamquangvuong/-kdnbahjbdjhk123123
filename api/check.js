const redis = require("../lib/db");
const { getHistory } = require("../lib/mb");

module.exports = async (req, res) => {

  const note = req.query.note;
  if (!note) return res.json({ error: "missing note" });

  const payment = await redis.get(`pay:${note}`);
  if (!payment) return res.json({ status: "not_found" });

  // hết hạn
  if (Date.now() - payment.createdAt > 2 * 60 * 1000) {
    payment.status = "expired";
    await redis.set(`pay:${note}`, payment);
    return res.json({ status: "expired" });
  }

  const history = await getHistory();

  const found = history.find(tx => {
    const desc = (tx.transactionDesc || "").toLowerCase();
    return desc.includes(note.toLowerCase()) &&
           tx.amount >= payment.amount; // 🔥 chống thiếu tiền
  });

  if (found) {
    payment.status = "paid";
    payment.paidAt = Date.now();
    await redis.set(`pay:${note}`, payment);
  }

  res.json({ status: payment.status });
};
