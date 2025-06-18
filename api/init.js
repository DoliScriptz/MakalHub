import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const ua = req.headers["user-agent"];
  if (ua !== "MakalHubExecutor") return res.status(403).end("Forbidden");

  const { userid, username } = req.query;
  if (!userid || !username) return res.status(400).end("Missing creds");

  // make a token valid for 2 minutes
  const expires = Date.now() + 2 * 60 * 1000;
  const payload = `${userid}:${username}:${expires}`;
  const sig = crypto
    .createHmac("sha256", process.env.HWID_SECRET)
    .update(payload)
    .digest("hex");

  return res.status(200).json({ token: `${payload}:${sig}` });
}
