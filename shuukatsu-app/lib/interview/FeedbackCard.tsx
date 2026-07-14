interface Props {
  feedback: string[];
}

export default function FeedbackCard({
  feedback,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-5">
        💡 改善アドバイス
      </h2>

      <ul className="space-y-3">

        {feedback.map((item, index) => (
          <li
            key={index}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded"
          >
            {item}
          </li>
        ))}

      </ul>

    </div>
  );
}