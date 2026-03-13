/** One-line credit: copyright + "Built with ♥ by 9logic Labs LLC". Use in full footer or minimal footer. */
export function SiteFooterCredit() {
  const year = new Date().getFullYear();
  return (
    <>
      © {year} Trinity House Church. All rights reserved.
      {" · "}
      Built with <span className="text-red-400" aria-hidden="true">♥</span> by 9logic Labs LLC
    </>
  );
}

/** Minimal footer bar (e.g. for events, watch, login, register, dashboard). */
export function SiteFooterMinimal() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-slate-900 px-4 py-4 text-center text-sm text-slate-400">
      <SiteFooterCredit />
    </footer>
  );
}
