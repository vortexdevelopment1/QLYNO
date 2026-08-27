export function ErrorState({ title = "Something needs attention", description }: { title?: string; description?: string }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  );
}
