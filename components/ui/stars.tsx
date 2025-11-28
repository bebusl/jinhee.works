import React from "react";

type Props = {};

const Star = ({ width, height }: { width?: string; height?: string }) => (
  <svg
    width={width ?? "12px"}
    height={height ?? "12px"}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      opacity="0.15"
      d="M12 3C12 7.97056 16.0294 12 21 12C16.0294 12 12 16.0294 12 21C12 16.0294 7.97056 12 3 12C7.97056 12 12 7.97056 12 3Z"
      fill="#000000"
    />
    <path
      d="M12 3C12 7.97056 16.0294 12 21 12C16.0294 12 12 16.0294 12 21C12 16.0294 7.97056 12 3 12C7.97056 12 12 7.97056 12 3Z"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Stars = (props: Props) => {
  return (
    <div className="w-full h-full grid grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => {
        // const hidden = Math.random() < 0.4;
        return (
          <div
            key={i}
            className={`dot animate-caret-blink `}
            style={{ animationDelay: `${Math.random() * 2}s` }}
          >
            ⚡️
          </div>
        );
      })}
    </div>
  );
};

export default Stars;
