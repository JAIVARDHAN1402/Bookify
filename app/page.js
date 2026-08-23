import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Event } from "@/lib/models";
import EventPoster from "@/components/EventPoster";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const type = params?.type ?? "";
  const date = params?.date ?? "";
  const q = params?.q ?? "";

  await connectDB();
  const filter = { status: "scheduled" };
  if (type === "movie" || type === "concert") filter.type = type;
  if (date) filter.date = date;
  if (q) filter.title = { $regex: q, $options: "i" };

  const events = await Event.find(filter).sort({ date: 1, time: 1 }).populate("venueId", "name address").lean();

  return (
    <div>
      <section className="relative mb-10 overflow-hidden rounded-3xl px-6 py-14 sm:px-12 sm:py-20">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(120deg, #4c1d95, #6d28d9 45%, #db2777 85%)" }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.45), transparent 45%), radial-gradient(circle at 10% 90%, rgba(56,189,248,0.35), transparent 45%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
            Movies &amp; concerts
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Book your seat,
            <br />
            live the moment.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
            Real-time seat maps, instant holds, and automatic waitlists — never miss a show again.
          </p>
        </div>
      </section>

      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        <span className="text-sm muted">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>

      <form className="card mb-8 flex flex-wrap items-end gap-3 !p-4">
        <div className="min-w-[160px] flex-1">
          <label className="field-label mb-1 block">Search</label>
          <input name="q" defaultValue={q} placeholder="Search title..." className="input" />
        </div>
        <div className="min-w-[140px]">
          <label className="field-label mb-1 block">Type</label>
          <select name="type" defaultValue={type} className="input">
            <option value="">All types</option>
            <option value="movie">Movie</option>
            <option value="concert">Concert</option>
          </select>
        </div>
        <div className="min-w-[160px]">
          <label className="field-label mb-1 block">Date</label>
          <input type="date" name="date" defaultValue={date} className="input" />
        </div>
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {events.length === 0 && (
        <div className="card py-16 text-center">
          <p className="mb-1 text-3xl">🎭</p>
          <p className="muted">No events found. Try a different filter.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => {
          const lowest = Math.min(...ev.categoryPricing.map((p) => p.price));
          return (
            <Link
              key={ev._id}
              href={`/events/${ev._id}`}
              className="group relative block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <EventPoster title={ev.title} posterUrl={ev.posterUrl} type={ev.type} zoomOnHover />

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(8,8,14,0.92) 0%, rgba(8,8,14,0.55) 35%, rgba(8,8,14,0.05) 65%)",
                  }}
                />

                <span className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {ev.type}
                </span>
                <span
                  className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow"
                  style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
                >
                  from ${lowest}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-base font-bold leading-snug text-white drop-shadow-sm">{ev.title}</h3>
                  <p className="mt-1 text-xs text-white/75">
                    {ev.date} · {ev.time}
                  </p>
                  <p className="text-xs text-white/60">{ev.venueId?.name}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
