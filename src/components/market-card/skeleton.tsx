import { Card } from "../ui/card";

export const LoadingSkeleton = () => (
    <Card className="h-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border-none">
      <div className="p-6 space-y-2">
        <div className="h-6 w-1/3 bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="px-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-20 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-10 bg-gray-700 rounded animate-pulse" />
      </div>
    </Card>
  );