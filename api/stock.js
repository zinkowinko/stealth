let stock = 12;
export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ stock });
  } else if (req.method === "POST") {
    if (stock <= 0) {
      return res.status(400).json({ error: "Out of stock" });
    }
    stock -= 1;
    res.status(200).json({ stock });
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
