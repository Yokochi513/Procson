"use client";

import type { LikertValue } from "@/lib/types";

const OPTIONS: { value: LikertValue; label: string }[] = [
  { value: 5, label: "とても当てはまる" },
  { value: 4, label: "やや当てはまる" },
  { value: 3, label: "どちらでもない" },
  { value: 2, label: "あまり当てはまらない" },
  { value: 1, label: "全く当てはまらない" },
];

interface LikertScaleProps {
  value?: LikertValue;
  onChange: (value: LikertValue) => void;
}

export function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-3 py-3 rounded-xl text-sm font-medium transition-all border-2 cursor-pointer ${
            value === option.value
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
              : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
