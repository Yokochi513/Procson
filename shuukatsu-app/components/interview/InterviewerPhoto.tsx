"use client";

import { useState } from "react";
import { InterviewerAvatar } from "./InterviewerAvatar";

interface Props {
  /** 発話中は枠が光り、臨場感を出す */
  speaking?: boolean;
  size?: number;
  className?: string;
}

/**
 * 面接官の顔写真を表示する。
 * public/interviewer.jpg が存在すればその写真を、
 * 無ければ SVG イラスト（InterviewerAvatar）にフォールバックする。
 */
export function InterviewerPhoto({
  speaking = false,
  size = 96,
  className = "",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <InterviewerAvatar speaking={speaking} size={size} className={className} />
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 transition-all duration-300 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: speaking
          ? "0 0 0 4px #ff7a1a, 0 0 20px rgba(255,122,26,0.6)"
          : "0 0 0 3px rgba(255,255,255,0.15)",
      }}
    >
      {/* next/image ではなく素の img（public 直下の任意画像を確実に表示するため） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/interviewer.jpg"
        alt="面接官"
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
