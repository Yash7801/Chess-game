
export const MoveList = ({ moves }: { moves: string[] }) => {
  return (
    <div className="bg-[#262421] text-white p-3 rounded h-80 overflow-y-auto text-sm">
      <h3 className="font-semibold mb-2">Moves</h3>
      <ol className="space-y-1">
        {moves.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ol>
    </div>
  );
};
