import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Feature from "@/components/Feature";
import Philosophy from "@/components/Philosophy";
import Delivery from "@/components/Delivery";
import Testimonials from "@/components/Testimonials";
import Community from "@/components/Community";
import Footer from "@/components/Footer";
import { getCatalogue } from "@/lib/catalogue";


export default async function Home() {
  const [hero] = await getCatalogue();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Benefits />
        {hero && <Feature product={hero} />}
        <Philosophy />
        <Delivery />
        <Testimonials />
        <Community />
      </main>
      <Footer />
    </>
  );
}
