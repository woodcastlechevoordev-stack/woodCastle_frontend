import type { Metadata } from "next";
import { getStaticPage, siteInfo } from "@/lib/api";
import { publicPageMetadata } from "@/lib/seo";
import { resolveStaticPageHtml } from "@/lib/utils";

export const revalidate = 60;

const DEFAULT_TERMS_HTML = `
<p>These Terms and Conditions (“Terms”) govern your use of the ${siteInfo.name} website and any enquiry, visit, or order discussion with ${siteInfo.name}, ${siteInfo.address}, ${siteInfo.city} (“we”, “us”, “our”). By using this website or sending an enquiry, you agree to these Terms.</p>
<h2>1. About ${siteInfo.name}</h2>
<p>${siteInfo.name} is a furniture showroom and workshop in ${siteInfo.address}, ${siteInfo.city}. We specialise in 100% teak wood furniture. Product listings on this website are for information and enquiry. Prices, finishes, and availability may change without notice.</p>
<h2>2. Enquiries, Not Online Checkout</h2>
<p>This website does not complete online purchases. When you submit an enquiry (including via WhatsApp, phone, email, or the enquiry form), you request information or a quotation. A contract is formed only when we confirm specifications, price, and terms in writing and you accept that confirmation.</p>
<h2>3. Product Information</h2>
<p>Images, dimensions, descriptions, and finishes are shown as a guide. Natural teak varies in grain, colour, and figure. Minor variations from photographs are normal and are not a defect. Custom or made-to-order pieces follow the specification we confirm with you.</p>
<h2>4. Pricing And Offers</h2>
<p>Prices, if shown, are indicative and in Indian Rupees unless stated otherwise. Offers, discounts, and seasonal promotions apply only for the period and products we specify, and may be withdrawn or amended. Eligibility is confirmed by our team when you enquire.</p>
<h2>5. Measurements And Site Conditions</h2>
<p>You are responsible for providing accurate room measurements, access details (stairs, lifts, door widths), and site conditions. We are not liable for pieces that cannot be delivered or installed because of incorrect information supplied by you.</p>
<h2>6. Orders, Deposits, And Lead Times</h2>
<p>Made-to-order furniture may require a deposit before production. Lead times are estimates and can vary with timber supply, finish, and workshop load. Delivery or collection dates are confirmed separately. Cancellation, refund, and alteration rules for a specific order will be stated in our written confirmation.</p>
<h2>7. Delivery, Inspection, And Care</h2>
<p>Delivery, if offered, is arranged as agreed in writing. Please inspect furniture on receipt and report visible damage or shortage promptly. Solid wood responds to climate; keep pieces away from prolonged direct sun, extreme moisture, and harsh chemicals. Follow any care advice we provide.</p>
<h2>8. Website Use</h2>
<p>You may not misuse this website, attempt unauthorised access, or copy content, images, or branding for commercial use without our permission. We may update product information, offers, and these Terms at any time. The version published on this page applies from the date it is posted.</p>
<h2>9. Intellectual Property</h2>
<p>All website content, including text, photographs, logos, and layout, belongs to ${siteInfo.name} or its licensors. You may not reproduce it without prior written consent.</p>
<h2>10. Limitation Of Liability</h2>
<p>To the extent permitted by law, we are not liable for indirect or consequential loss arising from website use, delays, or reliance on catalogue information. Nothing in these Terms limits liability that cannot be excluded under applicable Indian law.</p>
<h2>11. Governing Law</h2>
<p>These Terms are governed by the laws of India. Courts in Thrissur, Kerala shall have jurisdiction, subject to any mandatory legal rights you have as a consumer.</p>
<h2>12. Contact</h2>
<p>${siteInfo.name}, ${siteInfo.address}, ${siteInfo.city} ${siteInfo.postalCode}<br>
Phone: ${siteInfo.phone}<br>
Email: ${siteInfo.email}</p>
`;

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
          __html: resolveStaticPageHtml(page?.content, DEFAULT_TERMS_HTML),
        }}
      />
    </div>
  );
}
