import { CartProvider } from "@/components/shop/Cart";
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
