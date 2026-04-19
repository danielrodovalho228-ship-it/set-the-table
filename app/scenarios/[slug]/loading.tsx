export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-5 pt-10">
      <div className="animate-pulse grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="h-6 w-24 bg-stone-200 rounded" />
          <div className="h-12 w-3/4 bg-stone-200 rounded" />
          <div className="h-4 w-full bg-stone-100 rounded" />
          <div className="h-4 w-5/6 bg-stone-100 rounded" />
        </div>
        <div className="aspect-[5/4] bg-stone-100 rounded-xl" />
      </div>
      <div className="mt-12 space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
