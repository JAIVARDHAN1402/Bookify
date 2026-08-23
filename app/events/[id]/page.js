import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Event } from "@/lib/models";
import { posterGradient } from "@/lib/posterGradient";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }) {
  const { id } = await params;

  await connectDB();
  const event = await Event.findById(id).populate("venueId").lean().catch(() => null);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="mb-6 flex h-40 items-end rounded-2xl p-6 shadow-sm"
        style={{ background: posterGradient(event.title) }}
      >
        <div>
          <span className="badge !bg-white/20 !text-white backdrop-blur-sm">{event.type}</span>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{event.title}</h1>
        </div>
      </div>

      {event.description && <p className="mb-6 muted">{event.description}</p>}

      <div className="card">
        <dl className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
          <dt className="field-label">Date</dt>
          <dd className="font-medium">{event.date}</dd>
          <dt className="field-label">Time</dt>
          <dd className="font-medium">{event.time}</dd>
          <dt className="field-label">Venue</dt>
          <dd>
            <span className="font-medium">{event.venueId?.name}</span>
            <br />
            <span className="muted">{event.venueId?.address}</span>
          </dd>
        </dl>
      </div>

      <div className="card mt-4">
        <h2 className="mb-3 font-semibold">Pricing</h2>
        <ul className="text-sm">
          {event.categoryPricing.map((cp) => (
            <li key={cp.category} className="flex items-center justify-between border-b py-2 last:border-0" style={{ borderColor: "var(--border)" }}>
              <span className="badge">{cp.category}</span>
              <span className="font-semibold">${cp.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href={`/events/${event._id}/seats`} className="btn-primary mt-6 w-full sm:w-auto">
        Select seats →
      </Link>
    </div>
  );
}
