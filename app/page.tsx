import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Selection from "@/components/Selection";
import Philosophy from "@/components/Philosophy";
import Press from "@/components/Press";
import Community from "@/components/Community";
import Appointment from "@/components/Appointment";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <Selection />
        <Philosophy />
        <Press />
        <Community />
        <Appointment />
      </main>
      <Footer />
    </>
  );
}
