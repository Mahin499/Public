import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "https://fkgtvckcavjughvkshrq.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_-utETNszkOg-Rcb42h435A_rNw1jdy4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
app.use(express.json());

const PORT = 3000;

// Bad words filter
const BLOCKED_WORDS = ["badword1", "badword2", "abuse", "hate", "toxic"];

function filterText(text: string): string {
  let filtered = text;
  BLOCKED_WORDS.forEach(word => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "***");
  });
  return filtered;
}

// API Routes
app.get("/api/confessions", async (req, res) => {
  const sort = req.query.sort === 'likes' ? 'like' : 'created_at';
  const { data, error } = await supabase
    .from('confession')
    .select('*')
    .order(sort, { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });
  
  // Map Supabase fields to frontend expected fields
  const mappedData = data.map((c: any) => ({
    id: c.id,
    text: c.confessions,
    likes: c.like,
    category: c.category || 'GENERAL',
    createdAt: c.created_at
  }));

  res.json(mappedData);
});

app.post("/api/confessions", async (req, res) => {
  const { text, category } = req.body;
  if (!text || text.length < 5) {
    return res.status(400).json({ error: "Confession too short" });
  }

  const filteredText = filterText(text);
  
  const { data, error } = await supabase
    .from('confession')
    .insert([{ 
      confessions: filteredText, 
      category: category || 'GENERAL',
      like: 0 
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({
    id: data.id,
    text: data.confessions,
    likes: data.like,
    category: data.category,
    createdAt: data.created_at
  });
});

app.post("/api/confessions/:id/like", async (req, res) => {
  const { id } = req.params;
  
  // First get current like count
  const { data: current, error: getError } = await supabase
    .from('confession')
    .select('like')
    .eq('id', id)
    .single();

  if (getError) return res.status(500).json({ error: getError.message });

  const { data, error } = await supabase
    .from('confession')
    .update({ like: (current.like || 0) + 1 })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    id: data.id,
    text: data.confessions,
    likes: data.like,
    category: data.category,
    createdAt: data.created_at
  });
});

app.delete("/api/confessions/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('confession')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/stats", async (req, res) => {
  const { count, error: countError } = await supabase
    .from('confession')
    .select('*', { count: 'exact', head: true });

  const { data: topLiked, error: topError } = await supabase
    .from('confession')
    .select('*')
    .order('like', { ascending: false })
    .limit(5);

  if (countError || topError) return res.status(500).json({ error: "Failed to fetch stats" });

  const mappedTopLiked = topLiked.map((c: any) => ({
    id: c.id,
    text: c.confessions,
    likes: c.like,
    category: c.category || 'GENERAL',
    createdAt: c.created_at
  }));

  res.json({
    totalConfessions: count || 0,
    topLiked: mappedTopLiked
  });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
