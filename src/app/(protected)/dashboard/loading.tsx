
import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse p-1">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="edged" className="h-28 bg-white border-gray-100">
             <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
             <div className="h-8 w-32 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>

      {/* Graph Skeleton */}
      <div className="h-64 bg-white/50 rounded-xl border-dashed border-2 border-gray-200" />

      {/* Balances List Skeleton */}
      <div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-200" />
                 <div className="h-4 w-32 bg-gray-200 rounded" />
               </div>
               <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
