interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({
  current,
  total,
}: Props) {

  const percent = (current / total) * 100;

  return (
    <div className="space-y-2">

      <div className="flex justify-between text-sm text-gray-600">

        <span>
          進捗
        </span>

        <span>
          {current} / {total}
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">

        <div
          className="bg-orange-500 h-3 rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
          }}
        />

      </div>

    </div>
  );
}