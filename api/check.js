const redis = require("../lib/redis");
const { getHistory } = require("../lib/mb");

module.exports = async (req, res) => {
  const note = req.query.note;

  const pay = await redis.get("pay:" + note);
  if (!pay) return res.json({ status: "not_found" });

  if (Date.now() > pay.expire) {
    pay.status = "expired";
    await redis.set("pay:" + note, pay);
    return res.json({ status: "expired" });
  }

  const history = await getHistory();

  const found = history.find(tx =>
    (tx.description || "").includes(note)
  );

  if (found) {
    pay.status = "paid";
    await redis.set("pay:" + note, pay);
    return res.json({ status: "paid" });
  }

  res.json({ status: "pending" });
};
