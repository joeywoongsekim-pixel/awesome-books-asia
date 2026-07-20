// The signature visual: a fixed, page-wide surface everything sits on.
// Styling lives in globals.css (.desk-bg) so it stays a single source of truth.
export default function DeskBackground() {
  return <div className="desk-bg" aria-hidden="true" />;
}
