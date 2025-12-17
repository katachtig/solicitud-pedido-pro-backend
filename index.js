import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend solicitud pedido OK");
});

app.get("/apps/solicitud-pedido", (req, res) => {
  res.send("Health check OK");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
