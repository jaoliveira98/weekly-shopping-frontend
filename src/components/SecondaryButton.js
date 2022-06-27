export function SecondaryButton({ type, children }) {
  return (
    <button
      type={type}
      className="w-full py-2 bg-slate-300 text-slate-800 rounded drop-shadow-lg active:bg-slate-200 active:scale-95 active:drop-shadow-md transition duration-300"
    >
      {children}
    </button>
  );
}
