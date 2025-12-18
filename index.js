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

  const SHOP = process.env.SHOPIFY_SHOP;
  const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
  const TYPE = "solicitud_de_pedido";

  if (!SHOP || !TOKEN) {
    return res.status(500).json({ ok: false, code: "MISSING_ENV" });
  }

  const body = req.body || {};
  const customer = body.customer || {};
  const items = Array.isArray(body.items) ? body.items : [];

  const full_name = String(customer.name || "").trim();
  const email = String(customer.email || "").trim();

  if (!full_name || !email) {
    return res.status(400).json({
      ok: false,
      code: "VALIDATION_ERROR",
      fields: {
        full_name: !full_name ? "Requerido" : null,
        email: !email ? "Requerido" : null
      }
    });
  }

  const company = String(customer.company || "").trim();
  const phone = String(customer.phone || "").trim();
  const vat = String(customer.vat || "").trim();
  const address = String(customer.address_one_line || "").trim();
  const notes = String(customer.notes || "").trim();
  const submitted_at = new Date().toISOString();

  const items_text = items.map(it =>
    `${it.qty} × ${it.title}`
  ).join("\n");

  const gql = {
    query: `
      mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id type }
          userErrors { field message }
        }
      }
    `,
    variables: {
      metaobject: {
        type: TYPE,
        fields: [
          { key: "company", value: company },
          { key: "full_name", value: full_name },
          { key: "email", value: email },
          { key: "phone", value: phone },
          { key: "vat", value: vat },
          { key: "address", value: address },
          { key: "notes", value: notes },
          { key: "items_json", value: JSON.stringify(items) },
          { key: "items_text", value: items_text },
          { key: "submitted_at", value: submitted_at }
        ]
      }
    }
  };

  const r = await fetch(`https://${SHOP}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN
    },
    body: JSON.stringify(gql)
  });

  const data = await r.json().catch(() => null);

  if (!r.ok || !data) {
    return res.status(502).json({ ok: false, code: "SHOPIFY_API_ERROR" });
 const out = data.data && data.data.metaobjectCreate;
const errs = out && out.userErrors ? out.userErrors : [];

if (!out || errs.length) {
  return res.status(400).json({
    ok: false,
    code: "METAOBJECT_CREATE_FAILED",
    userErrors: errs
  });
}

return res.status(200).json({
  ok: true,
  message: "Solicitud de pedido enviada"
});

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
