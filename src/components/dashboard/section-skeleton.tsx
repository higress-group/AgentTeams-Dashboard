export function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg shimmer" />
      <div className="h-4 w-64 bg-muted rounded shimmer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl shimmer" />
        ))}
      </div>
      <div className="h-48 bg-muted rounded-xl shimmer" />
    </div>
  );
}
