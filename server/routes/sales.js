import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const salesFile = path.join(process.cwd(), "server", "sales.json");

function readSales() {
  if (!fs.existsSync(salesFile)) {
    fs.writeFileSync(salesFile, "[]");
  }

  return JSON.parse(fs.readFileSync(salesFile));
}

function saveSales(data) {
  fs.writeFileSync(salesFile, JSON.stringify(data, null, 2));
}

router.get("/", (req, res) => {
  res.json(readSales());
});

router.post("/", (req, res) => {
  const sales = readSales();

  const newSale = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };

  sales.unshift(newSale);

  saveSales(sales);

  res.status(201).json(newSale);
});

export default router;