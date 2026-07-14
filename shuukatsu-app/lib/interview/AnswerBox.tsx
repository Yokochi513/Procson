"use client";

import { MicButton } from "@/components/ui/MicButton";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function AnswerBox({
  value,
  onChange,
}: Props) {
  const maxLength = 500;

  const handleTranscript = (text: string) => {
    onChange((value + text).slice(0, maxLength));
  };

  return (
    <div className="space-y-2">

      <div className="flex justify-end">
        <MicButton onTranscript={handleTranscript} />
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ここに回答を入力してください...（🎤 音声入力も使えます）"
        maxLength={maxLength}
        rows={10}
        className="w-full border rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <div className="flex justify-between text-sm text-gray-500">

        <span>
          できるだけ具体的に書きましょう。
        </span>

        <span>
          {value.length} / {maxLength}
        </span>

      </div>

    </div>
  );
}
