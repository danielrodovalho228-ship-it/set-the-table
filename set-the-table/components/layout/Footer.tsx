export function Footer() {
  return (
    <footer className="border-t border-stone-200 mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-stone-500">
        <span>© {new Date().getFullYear()} Set the Table</span>
        <span>Built for dinners worth remembering.</span>
      </div>
    </footer>
  );
}
