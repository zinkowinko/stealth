const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const STOCK_FILE = "./stock.json";

app.get("/stock", (req, res) => {
  const data = JSON.parse(fs.readFileSync(STOCK_FILE));
  res.json({ stock: data.stock });
});

app.post("/buy", (req, res) => {
  const data = JSON.parse(fs.readFileSync(STOCK_FILE));

  if (data.stock <= 0) {
    return res.status(400).json({ error: "Out of stock" });
  }

  data.stock -= 1;
  fs.writeFileSync(STOCK_FILE, JSON.stringify(data, null, 2));

  res.json({ success: true, stock: data.stock });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
