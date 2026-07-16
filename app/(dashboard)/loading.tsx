import { SkeletonDashboard } from "@/components/states";

export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <SkeletonDashboard />
    </div>
  );
}
