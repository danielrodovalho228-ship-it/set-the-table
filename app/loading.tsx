export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-5 pt-16">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-2/3 bg-stone-200 rounded" />
        <div className="h-5 w-1/2 bg-stone-100 rounded" />
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-stone-100 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
