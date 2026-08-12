import type { Metadata } from "next";
import { getStaticPage, siteInfo } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getStaticPage("terms");
  return publicPageMetadata({
    metaTitle: page?.title,
    name: "Terms & Conditions",
    description: `Terms and conditions for enquiries with ${siteInfo.name}.`,
    canonical: "/terms-and-conditions",
  });
}

export default async function TermsPage() {
  const page = await getStaticPage("terms");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-3 font-heading text-4xl">
        {page?.title || "Terms & Conditions"}
      </h1>
      <div className="section-divider my-8" />
      <div
        className="space-y-4 text-brown-mid [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-brown-dark"
        dangerouslySetInnerHTML={{
          __html: page?.content
            ? page.content.includes("<")
              ? page.content
              : `<p>${page.content}</p>`
            : "<p>Terms will be published here.</p>",
        }}
      />
    </div>
  );
}
