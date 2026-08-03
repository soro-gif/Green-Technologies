import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import DomainsSection from "@/components/DomainsSection";
import PositioningSection from "@/components/PositioningSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import PortfolioGallery from "@/components/PortfolioGallery";
import WorkflowTimeline from "@/components/WorkflowTimeline";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import QuoteWizard from "@/components/QuoteWizard";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import Widgets from "@/components/Widgets";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-light dark:bg-brand-dark text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Hero Banner */}
      <Hero />

      {/* Key Numbers Counter */}
      <StatsCounter />

      {/* 4 Major Domains (Eau, Solaire, Agtech, BTP) */}
      <DomainsSection />

      {/* Positioning & Target Audiences */}
      <PositioningSection />

      {/* Why Choose Us (9 Trust Cards) */}
      <WhyChooseUs />

      {/* Realizations / Portfolio Gallery */}
      <PortfolioGallery />

      {/* 6-Step Workflow Timeline */}
      <WorkflowTimeline />

      {/* Testimonials Carousel */}
      <Testimonials />

      {/* Blog & Articles */}
      <BlogSection />

      {/* Interactive Instant Quote Calculator & Wizard */}
      <QuoteWizard />

      {/* Contact Info & Google Maps Abidjan */}
      <ContactSection />

      {/* FAQ Accordion */}
      <FAQSection />

      {/* Comprehensive Footer */}
      <Footer />

      {/* Floating WhatsApp & Back to top Widgets */}
      <Widgets />
    </main>
  );
}
