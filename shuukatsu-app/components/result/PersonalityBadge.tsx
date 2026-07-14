import type { PersonalityType } from "@/lib/types";
import { Card } from "../ui/Card";

export function PersonalityBadge({ type }: { type: PersonalityType }) {
  return (
    <Card className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 border-orange-100">
      <div className="text-5xl mb-3">{type.icon}</div>
      <h2 className="text-2xl font-bold text-orange-600">{type.name}</h2>
      <p className="mt-3 text-gray-600 leading-relaxed">{type.description}</p>
    </Card>
  );
}
