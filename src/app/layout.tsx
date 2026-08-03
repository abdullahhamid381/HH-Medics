import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { QuickViewModal } from "@/components/site/quick-view-modal";
import { Toaster } from "@/components/ui/toaster";
import { listCategories } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "HH Medics — Medicines, Supplements & Skincare",
  description:
    "Shop medicines, supplements, face wash, serums and cosmetics online — verified products, fast delivery, and clear labeling on everything.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await listCategories();
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-bg text-ink" suppressHydrationWarning>
        <Providers>
          <Header categories={categories} />
          <CartDrawer />
          <QuickViewModal />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
