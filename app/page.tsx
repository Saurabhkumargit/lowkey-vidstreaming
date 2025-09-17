
import Layout from "./components/Layout";

const MOCK_VIDEOS = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: `Sample Video Title ${i + 1}`,
  channel: `Channel ${((i % 5) + 1).toString()}`,
  views: `${(i + 1) * 3}k views`,
  time: `${(i % 12) + 1} months ago`,
}));

export default function Home() {
  return (
    <Layout>
      <section className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-white/90">Home</h1>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {MOCK_VIDEOS.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition">
              <div className="aspect-video w-full bg-[#181818]" />
              <div className="p-3">
                <h2 className="text-sm font-semibold text-white/90 line-clamp-2">{v.title}</h2>
                <p className="text-xs text-white/60 mt-1">{v.channel}</p>
                <p className="text-[11px] text-white/40">{v.views} • {v.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
