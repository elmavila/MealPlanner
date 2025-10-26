import React from "react";

const Recipes: React.FC = () => {
    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h1>Coming soon</h1>
        </div>
    );
};

export default Recipes;

// interface Recipe {
//     id: string;
//     title: string;
//     description?: string;
//     image?: string;
//     ingredients?: string[];
// }

// const mockRecipes: Recipe[] = [
//     {
//         id: "1",
//         title: "Ugnsbakad lax med citron",
//         description: "Lätt och snabbt, perfekt till vardags.",    },
//     {
//         id: "2",
//         title: "Vegetarisk lasagne",
//         description: "Krämig lasagne med spenat och ricotta.",    },
// ];

// const Recipes: React.FC = () => {
//     const [recipes, setRecipes] = useState<Recipe[]>([]);
//     const [query, setQuery] = useState<string>("");

//     useEffect(() => {
//         // Förslag: byt ut URL mot din API-endpoint om du har en backend.
//         const fetchRecipes = async () => {
//             try {
//                 const res = await fetch("/api/recipes");
//                 if (!res.ok) throw new Error("Ingen API-data");
//                 const data: Recipe[] = await res.json();
//                 setRecipes(data);
//             } catch {
//                 // Fallback till mock-data för utveckling
//                 setRecipes(mockRecipes);
//             }
//         };

//         fetchRecipes();
//     }, []);

//     const onSearch = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);

//     const filtered = recipes.filter((r) =>
//         r.title.toLowerCase().includes(query.toLowerCase())
//     );

//     return (
//         <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
//             <h1>My recipes</h1>

//             <div style={{ marginBottom: 16 }}>
//                 <input
//                     value={query}
//                     onChange={onSearch}
//                     placeholder="Sök recept..."
//                     style={{
//                         padding: 8,
//                         width: "100%",
//                         maxWidth: 400,
//                         boxSizing: "border-box",
//                         borderRadius: 4,
//                         border: "1px solid #ccc",
//                     }}
//                     aria-label="Sök recept"
//                 />
//             </div>

//             <div style={{ display: "grid", gap: 12 }}>
//                 {filtered.length === 0 ? (
//                     <div>Inga recept hittades.</div>
//                 ) : (
//                     filtered.map((r) => (
//                         <article
//                             key={r.id}
//                             style={{
//                                 border: "1px solid #eee",
//                                 padding: 12,
//                                 borderRadius: 6,
//                                 display: "flex",
//                                 gap: 12,
//                                 alignItems: "center",
//                             }}
//                         >
//                             <div
//                                 style={{
//                                     width: 80,
//                                     height: 80,
//                                     background: "#f4f4f4",
//                                     borderRadius: 6,
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     fontSize: 12,
//                                     color: "#666",
//                                 }}
//                             >
//                                 {r.image ? (
//                                     <img
//                                         src={r.image}
//                                         alt={r.title}
//                                         style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
//                                     />
//                                 ) : (
//                                     "Ingen bild"
//                                 )}
//                             </div>

//                             <div style={{ flex: 1 }}>
//                                 <h2 style={{ margin: 0, fontSize: 18 }}>{r.title}</h2>
//                                 {r.description && <p style={{ margin: "6px 0", color: "#555" }}>{r.description}</p>}
//                             </div>
//                         </article>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Recipes;