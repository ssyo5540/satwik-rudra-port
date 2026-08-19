import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Journey from "@/components/Journey";
import Work from "@/components/Work";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Capabilities from "@/components/Capabilities";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Compact bar for < lg; the sidebar takes over above that. */}
      <Nav />
      <Sidebar />

      <main>
        <Hero />
        {/* Everything past the hero is inset to clear the fixed sidebar. */}
        <div className="with-sidebar">
          <Statement />
          <Journey />
          <Work />
          <Projects />
          <Education />
          <Capabilities />
          <CTA />
          <FAQ />
        </div>
      </main>

      <div className="with-sidebar">
        <Footer />
      </div>
    </>
  );
}
