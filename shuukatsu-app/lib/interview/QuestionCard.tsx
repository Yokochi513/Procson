interface Props {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  question: string;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  category,
  question,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between items-center mb-4">

        <span className="text-sm text-gray-500">
          質問 {questionNumber} / {totalQuestions}
        </span>

        <span className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-full">
          {category}
        </span>

      </div>

      <h2 className="text-2xl font-bold text-gray-800 leading-9">
        {question}
      </h2>

    </div>
  );
}