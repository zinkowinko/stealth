const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const STOCK_FILE = "./stock.json";

app.get("/api/stock", (req, res) => {
  const data = JSON.parse(fs.readFileSync(STOCK_FILE));
  res.json({ stock: data.stock });
});

app.post("/api/buy", (req, res) => {
  const data = JSON.parse(fs.readFileSync(STOCK_FILE));
  if (data.stock <= 0) return res.status(400).json({ error: "Out of stock" });
  data.stock -= 1;
  fs.writeFileSync(STOCK_FILE, JSON.stringify(data, null, 2));
  res.json({ stock: data.stock });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
