import { redirect } from "next/navigation";

export default function ProductsIndex() {
  // Redirect to the default subpage
  redirect("/admin/products/manage");
}
