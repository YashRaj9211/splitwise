
import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse p-1">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} variant="edged" className="h-32 bg-white/50 border-gray-100">
            <div className="p-1">
              <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-40 bg-gray-100 rounded mt-3" />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="h-8 w-32 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      </div>

      {/* Expenses List Skeleton */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center">
             <div className="flex gap-4 items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex flex-col gap-2">
                   <div className="w-48 h-5 bg-gray-200 rounded" />
                   <div className="w-24 h-4 bg-gray-100 rounded" />
                </div>
             </div>
             <div className="flex flex-col items-end gap-2">
               <div className="w-24 h-6 bg-gray-200 rounded" />
               <div className="w-16 h-4 bg-gray-100 rounded" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
