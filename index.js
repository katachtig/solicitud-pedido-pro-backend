import express from "express";

const app = express();

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.get("/apps/solicitud-pedido", (req, res) => {
  res.status(200).send("OK");
});

app.options("/apps/solicitud-pedido", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://losconsejosdemichael.com");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(204).end();
});

app.post("/apps/solicitud-pedido", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://losconsejosdemichael.com");
  res.setHeader("Vary", "Origin");

  const body = req.body || {};
  const customer = body.customer || {};
  const items = Array.isArray(body.items) ? body.items : [];

  const name = String(customer.name || "").trim();
  const email = String(customer.email || "").trim();

  if (!name || !email) {
    return res.status(400).json({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Faltan datos obligatorios",
      fields: {
        name: !name ? "Requerido" : null,
        email: !email ? "Requerido" : null
      }
    });
  }

  if (!items.length) {
    return res.status(400).json({
      ok: false,
      code: "EMPTY_CART",
      message: "No hay productos en la solicitud"
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Solicitud de pedido enviada",
    received: {
      customer: {
        name,
        email,
        company: String(customer.company || "").trim(),
        phone: String(customer.phone || "").trim()
      },
      items
    }
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
