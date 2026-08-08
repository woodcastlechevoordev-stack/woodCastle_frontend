const testimonials = [
  {
    quote:
      "Our dining table arrived beautifully finished — the grain is stunning and the joinery feels rock solid.",
    name: "Ananya Krishnan",
    place: "Kochi",
  },
  {
    quote:
      "From enquiry to delivery, the team was patient and clear. The wardrobe fit our room perfectly.",
    name: "Rahul Menon",
    place: "Bengaluru",
  },
  {
    quote:
      "Finally furniture that feels like it will last. Warm finish, honest wood — exactly what we wanted.",
    name: "Meera Joseph",
    place: "Thrissur",
  },
] as const;

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-10 text-center">
        <p className="eyebrow">Testimonials</p>
        <h2 className="mt-3 font-heading text-3xl sm:text-4xl">Homes furnished with care</h2>
        <div className="section-divider mx-auto mt-6 max-w-xs" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote
            key={t.name}
            className="rounded-xl border border-brown-light/50 bg-white p-6 shadow-sm"
          >
            <p className="text-brown-mid">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-5">
              <cite className="not-italic font-semibold text-brown-dark">{t.name}</cite>
              <p className="text-xs text-brown-light">{t.place}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
