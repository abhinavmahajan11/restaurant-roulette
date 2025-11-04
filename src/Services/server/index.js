import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5174;
const YELP_KEY = process.env.YELP_API_KEY;

app.get("/api/yelp/search", async (req, res) => {
  try {
    const { term = "restaurants", latitude, longitude, radius, categories } = req.query;
    const url = new URL("https://api.yelp.com/v3/businesses/search");
    if (latitude && longitude) { url.searchParams.set("latitude", latitude); url.searchParams.set("longitude", longitude); }
    if (radius) url.searchParams.set("radius", radius);
    if (categories) url.searchParams.set("categories", categories);
    url.searchParams.set("term", term);

    const resp = await fetch(url.toString(), { headers: { Authorization: `Bearer ${YELP_KEY}` } });
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Proxy listening on http://localhost:${PORT}`));
