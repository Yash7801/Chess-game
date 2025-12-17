import React, { useEffect, useState } from "react";

interface Props {
  turn: "w" | "b";
  isGameOver: boolean;
  initialSeconds: number;
  onTimeout: (color: "white" | "black") => void;
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
  onTimeout,
}) => {
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);

  useEffect(() => {
    if (isGameOver) return;

    const id = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((t) => {
          if (t <= 1) {
            onTimeout("white");
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            onTimeout("black");
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => clearInterval(id);
  }, [turn, isGameOver, onTimeout]);

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
