import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getCategories } from "@/lib/api";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <>
      <Header categories={categories} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
    </>
  );
}
