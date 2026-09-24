export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4">
        <p>© {new Date().getFullYear()} GREEN TECHNOLOGIES. Tous droits réservés.</p>
        <p className="mt-1 text-slate-600">Architecture Laravel REST API + React 19 / TypeScript / Vite / Tailwind CSS</p>
      </div>
    </footer>
  );
}
