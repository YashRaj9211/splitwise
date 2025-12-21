
import { Card } from "@/components/ui/Card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse p-1">
      <div className="flex items-center justify-between">
         <div className="h-8 w-32 bg-gray-200 rounded" />
         <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} variant="edged" className="flex items-center gap-4 h-20 bg-white border-gray-100">
             <div className="w-12 h-12 rounded-full bg-gray-200" />
             <div className="flex flex-col gap-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
