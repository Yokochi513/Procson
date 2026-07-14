import type { JobType } from "@/lib/types";
import { Card } from "../ui/Card";

interface JobTypeGridProps {
  jobTypes: { jobType: JobType; score: number }[];
}

export function JobTypeGrid({ jobTypes }: JobTypeGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobTypes.map(({ jobType, score }, index) => (
        <Card
          key={jobType.id}
          className={`relative ${index === 0 ? "ring-2 ring-orange-400 bg-indigo-50" : ""}`}
        >
          {index === 0 && (
            <span className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              最も向いている
            </span>
          )}
          <div className="text-3xl mb-2">{jobType.icon}</div>
          <h4 className="text-lg font-bold text-gray-800">{jobType.name}</h4>
          <p className="text-sm text-gray-500 mt-1">{jobType.description}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">適性</span>
              <span className="font-bold text-orange-500">{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
