const redis = require("../lib/db");
const { getHistory } = require("../lib/mb");

module.exports = async (req, res) => {
  try {
    const note = req.query.note;
    if (!note) return res.json({ error: "missing note" });

    const payment = await redis.get(`pay:${note}`);
    if (!payment) return res.json({ status: "not_found" });

    const history = await getHistory();

    const found = history.find(tx =>
      (tx.transactionDesc || "").toLowerCase().includes(note.toLowerCase())
    );

    if (found) {
      payment.status = "paid";
      await redis.set(`pay:${note}`, payment);
    }

    res.json({ status: payment.status });

  } catch (e) {
    console.log(e);
    res.json({ status: "error", msg: e.message });
  }
};
