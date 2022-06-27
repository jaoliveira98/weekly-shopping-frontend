export function PrimaryButton({ type, children }) {
  return (
    <button
      type={type}
      className="w-full py-2 bg-slate-800 text-slate-100 rounded drop-shadow-lg active:bg-slate-600 active:scale-95 active:drop-shadow-md transition duration-300"
    >
      {children}
    </button>
  );
}
