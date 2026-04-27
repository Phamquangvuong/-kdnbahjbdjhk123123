const redis = require("../lib/redis");
const { getHistory } = require("../lib/mb");

module.exports = async (req, res) => {
  try {
    const note = req.query.note;
    if (!note) return res.json({ error: "missing note" });

    const payment = await redis.get(`pay:${note}`);
    if (!payment) return res.json({ status: "not_found" });

    // ⛔ hết hạn
    if (Date.now() > payment.expireAt) {
      payment.status = "expired";
      await redis.set(`pay:${note}`, payment);
      return res.json({ status: "expired" });
    }

    // 🔍 check lịch sử
    const history = await getHistory();

    const found = history.find(tx =>
      (tx.transactionDesc || "").toLowerCase().includes(note.toLowerCase())
    );

    if (found) {
      payment.status = "paid";
      await redis.set(`pay:${note}`, payment);
      return res.json({ status: "paid" });
    }

    res.json({ status: "pending" });

  } catch (e) {
    res.json({ error: e.message });
  }
};
