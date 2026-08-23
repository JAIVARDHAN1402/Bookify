import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Event } from "@/lib/models";
import { posterGradient } from "@/lib/posterGradient";

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
      <section
        className="mb-10 overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16"
        style={{ background: "linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 40%, var(--accent)))" }}
      >
        <p className="badge mb-4 !bg-white/15 !text-white">Movies &amp; concerts</p>
        <h1 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Book your seat, live the moment.
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/80">
          Real-time seat maps, instant holds, and automatic waitlists — never miss a show again.
        </p>
      </section>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
      </div>

      <form className="card mb-8 flex flex-wrap items-end gap-3 !p-4">
        <div className="flex-1 min-w-[160px]">
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
        <div className="card py-12 text-center">
          <p className="muted">No events found. Try a different filter.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((ev) => (
          <Link key={ev._id} href={`/events/${ev._id}`} className="card card-hover group overflow-hidden !p-0">
            <div
              className="flex h-28 items-end p-4"
              style={{ background: posterGradient(ev.title) }}
            >
              <span className="badge !bg-white/20 !text-white backdrop-blur-sm">{ev.type}</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold transition group-hover:opacity-80">{ev.title}</h3>
              <p className="mt-1.5 text-sm muted">
                {ev.date} · {ev.time}
              </p>
              <p className="text-sm muted">{ev.venueId?.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
