import React, { useEffect, useState } from "react";

interface Props {
  turn: "w" | "b";
  isGameOver: boolean;
  initialSeconds: number; // e.g. 5 * 60
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const TimerPanel: React.FC<Props> = ({
  turn,
  isGameOver,
  initialSeconds,
}) => {
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);

  useEffect(() => {
    if (isGameOver) return;

    const id = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((t) => Math.max(t - 1, 0));
      } else {
        setBlackTime((t) => Math.max(t - 1, 0));
      }
    }, 1000);

    return () => clearInterval(id);
  }, [turn, isGameOver]);

  return (
    <div className="bg-[#262421] text-white rounded-md p-3 text-sm">
      <div
        className={`flex justify-between py-1 px-2 rounded ${
          turn === "b" && !isGameOver ? "bg-[#38352f]" : ""
        }`}
      >
        <span>Black</span>
        <span>{formatTime(blackTime)}</span>
      </div>
      <div
        className={`flex justify-between py-1 px-2 rounded mt-1 ${
          turn === "w" && !isGameOver ? "bg-[#38352f]" : ""
        }`}
      >
        <span>White</span>
        <span>{formatTime(whiteTime)}</span>
      </div>
    </div>
  );
};
