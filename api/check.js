const redis = require("../lib/redis");
const { getHistory } = require("../lib/mb");

module.exports = async (req, res) => {

  const note = req.query.note;
  if (!note) return res.json({ error: "missing note" });

  const pay = await redis.get("pay:" + note);
  if (!pay) return res.json({ status: "not_found" });

  // hết hạn + grace 5s
  if (Date.now() > pay.expire + 5000){
    pay.status = "expired";
    await redis.set("pay:" + note, pay);
    return res.json({ status: "expired" });
  }

  // check 1
  let history = await getHistory();

  let found = history.find(tx =>
    (tx.description || "").toLowerCase().includes(note.toLowerCase())
  );

  // check 2 (tránh miss do cache)
  if (!found){
    await new Promise(r => setTimeout(r, 500));
    history = await getHistory();

    found = history.find(tx =>
      (tx.description || "").toLowerCase().includes(note.toLowerCase())
    );
  }

  if (found){
    pay.status = "paid";
    await redis.set("pay:" + note, pay);
    return res.json({ status: "paid" });
  }

  res.json({ status: "pending" });
};
