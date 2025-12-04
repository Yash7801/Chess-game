// ...existing code...
export const Button = ({ onClick, children, disabled = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-3 rounded font-semibold text-white transition ${
        disabled
          ? "bg-gray-600 cursor-not-allowed opacity-50"
          : "bg-green-600 hover:bg-green-700 active:scale-95"
      }`}
    >
      {children}
    </button>
  );
};