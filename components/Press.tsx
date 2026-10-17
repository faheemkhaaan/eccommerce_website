const quotes = [
  { text: "ÉPURE has mastered an architectural restraint rare in modern fashion. An antidote to excess.", source: "Vogue", tag: "Spring Feature" },
  { text: "A seamless bridge between monolithic Scandinavian forms and the gentle imperfection of wabi-sabi.", source: "Wallpaper*", tag: "Design Awards" },
  { text: "Objects and garments that transform everyday living into a quiet contemplation of pure space.", source: "Architectural Digest", tag: "Living Collective" },
];

export default function Press() {
  return (
    <section className="border-y border-line bg-sand py-14">
      <div className="wrap">
        <p className="eyebrow mb-8 text-center">Critical Reception</p>
        <ul className="grid gap-5 lg:grid-cols-3">
          {quotes.map((q) => (
            <li key={q.source} className="flex flex-col justify-between gap-6 rounded border border-line bg-paper p-7">
              <blockquote className="font-serif text-base italic leading-relaxed">“{q.text}”</blockquote>
              <footer className="label-sm flex justify-between text-[10px] text-muted">
                <strong className="font-semibold text-ink">{q.source}</strong>
                <span>{q.tag}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
