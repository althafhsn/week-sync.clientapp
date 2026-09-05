export function PageActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
      {children}
    </div>
  );
}
