const typeStyles = {
  info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
  error: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
  success: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
} as const;

export function Callout({
  icon = "💡",
  type = "info",
  children,
}: {
  icon?: string;
  type?: keyof typeof typeStyles;
  children: React.ReactNode;
}) {
  return (
    <div className={`my-4 flex gap-3 rounded-lg border p-4 ${typeStyles[type]}`}>
      <span className="text-xl leading-none mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
