import StoreNavbar from "./store-navbar";
import StoreFooter from "./store-footer";
import FaqSection from "./faq-section";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <FaqSection/>
      <StoreFooter />
    </div>
  );
}
