import { Card } from "../ui/Card";

export function StrengthList({ strengths }: { strengths: string[] }) {
  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-800 mb-4">💪 あなたの強み</h3>
      <ul className="space-y-3">
        {strengths.map((strength, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-700">
            <span className="shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            {strength}
          </li>
        ))}
      </ul>
    </Card>
  );
}
