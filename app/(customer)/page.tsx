import HomeClient from "@/components/HomeClient";

async function getProducts() {
  const res = await fetch("http://localhost:8081/api/products", {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch products");
  const json = await res.json();
  return json.result;
}

export default async function Home() {
  const products = await getProducts();

  return <HomeClient products={products} />;
}
