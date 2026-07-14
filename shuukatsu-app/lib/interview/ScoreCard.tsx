interface Props {
  total: number;
  logical: number;
  specific: number;
  passion: number;
  communication: number;
}

export default function ScoreCard({
  total,
  logical,
  specific,
  passion,
  communication,
}: Props) {
  const Item = ({
    title,
    score,
  }: {
    title: string;
    score: number;
  }) => (
    <div className="flex justify-between items-center border-b py-2">
      <span className="text-gray-700">{title}</span>
      <span className="font-bold text-orange-500">
        {score} 点
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        📊 面接結果
      </h2>

      <div className="text-center mb-8">

        <div className="text-6xl font-bold text-orange-500">
          {total}
        </div>

        <div className="text-gray-500 mt-2">
          総合評価
        </div>

      </div>

      <Item
        title="論理性"
        score={logical}
      />

      <Item
        title="具体性"
        score={specific}
      />

      <Item
        title="熱意"
        score={passion}
      />

      <Item
        title="コミュニケーション"
        score={communication}
      />

    </div>
  );
}