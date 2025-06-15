import crypto from "crypto";

export default function handler(req, res) {
  const { userid, username } = req.query;
  const secret = process.env.HWID_SECRET;

  if (!userid || !username || !secret) {
    return res
      .status(400)
      .json({ status: "error", reason: "Missing userid, username, or server secret" });
  }

  // Combine user data + timestamp to get unique per-call salt
  const base = `${userid}:${username}:${Date.now()}`;

  // Sign it with HMAC-SHA256 so no one can forge
  const hwid = crypto
    .createHmac("sha256", secret)
    .update(base)
    .digest("hex");

  return res.status(200).json({ status: "success", hwid });
}
