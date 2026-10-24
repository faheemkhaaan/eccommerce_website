const reviews = [
  {
    text: "It smells like the ghee my grandmother used to make in Gujranwala. My parathas finally taste like hers, and the 1 kg jar lasted our family about six weeks.",
    name: "Ayesha K.",
    city: "Lahore",
    tag: "1 kg jar",
  },
  {
    text: "I switched from cooking oil for karahi and biryani. It takes the heat without smoking out the kitchen, and you can taste the difference in the gravy.",
    name: "Bilal R.",
    city: "Karachi",
    tag: "2 kg tin",
  },
  {
    text: "Ordered with cash on delivery — the rider handed it over, I checked the seal and paid. No card, no advance, no fuss.",
    name: "Hina S.",
    city: "Islamabad",
    tag: "500 g jar",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-line bg-sand py-14">
      <div className="wrap">
        <p className="eyebrow mb-8 text-center">From Our Customers</p>
        <ul className="grid gap-5 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.name} className="flex flex-col justify-between gap-6 rounded border border-line bg-paper p-7">
              <blockquote className="font-serif text-base italic leading-relaxed">“{r.text}”</blockquote>
              <footer className="label-sm flex justify-between text-[10px] text-muted">
                <strong className="font-semibold text-ink">
                  {r.name} — {r.city}
                </strong>
                <span>{r.tag}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
