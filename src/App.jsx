import React, { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Star,
  Zap,
  Home,
  TrendingUp,
  Package,
  Flame,
} from "lucide-react";

import { supabase } from "./supabase";


// ENV VARS
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/categories?select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await res.json();
      setCategories([{ id: "all", name: "All", icon: "Package" }, ...data]);
    } catch {
      setCategories([
        { id: "all", name: "All", icon: "Package" },
        { id: 1, name: "Electronics", icon: "Zap" },
        { id: 2, name: "Home & Garden", icon: "Home" },
        { id: 3, name: "Fashion", icon: "TrendingUp" },
      ]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    let url = `${SUPABASE_URL}/rest/v1/products?select=*`;
    if (selectedCategory !== "all") {
      url += `&category_id=eq.${selectedCategory}`;
    }

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const data = await res.json();
    setProducts(data || []);
    setLoading(false);
  };

  const icons = { Package, Zap, Home, TrendingUp };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full text-white bg-[#0b0b0b]">
      {/* HEADER */}
      <div className="w-full bg-black/70 backdrop-blur border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2">
          <ShoppingCart className="text-purple-500" />
          <h1 className="font-extrabold text-xl">FindItOnAli</h1>
        </div>
      </div>

      {/* HERO */}
      <section className="w-full bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Viral Products{" "}
            <span className="text-purple-500">You Won’t Find</span> in the US
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Hand-picked gadgets, home hacks & fashion steals from AliExpress
          </p>

          <div className="max-w-xl mx-auto mt-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trending products..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-black focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <div className="w-full bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c) => {
            const Icon = icons[c.icon] || Package;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition ${
                  selectedCategory === c.id
                    ? "bg-purple-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                <Icon size={16} />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="w-full bg-[#0b0b0b]">
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {loading ? (
            <p className="text-center text-gray-400">Loading products…</p>
          ) : (
            <div className="grid gap-6 justify-center [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#141414] rounded-2xl overflow-hidden shadow-lg hover:shadow-purple-600/30 transition group hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={p.image_url}
                      className="w-full h-52 object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <Flame className="text-orange-500" size={14} />
                      Trending
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {p.description}
                    </p>

                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      {p.rating} ({p.reviews})
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-extrabold text-purple-500">
                        ${p.price}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            await supabase.from("orders").insert([
                              {
                                product_id: p.id,
                                product_name: p.name,
                                price: p.price
                              }
                            ]);
                          } catch (error) {
                            console.error("Failed to track order:", error);
                          }

                          window.open(p.aliexpress_url, "_blank");
                        }}
                        className="px-4 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-purple-500 hover:text-white transition"
                      >
                        Buy →
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto py-8 text-center text-gray-500 text-sm">
          Affiliate Disclosure: We may earn commission at no extra cost to you.
        </div>
      </div>
    </div>
  );
}
