export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-5 pt-12">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-40 bg-stone-200 rounded" />
        <div className="h-5 w-1/2 bg-stone-100 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 bg-stone-100 rounded-lg" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[4/3] bg-stone-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
