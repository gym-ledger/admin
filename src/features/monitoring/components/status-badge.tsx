import { cn } from "@/lib/utils";

/** HTTP status with its class in words, so it never relies on color alone. */
export function StatusBadge({ status }: { status: number }) {
  const server = status >= 500;
  const client = status >= 400 && status < 500;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums",
        server ? "bg-red-50 text-red-800" : client ? "bg-amber-50 text-amber-800" : "bg-zinc-100 text-zinc-700",
      )}
      title={server ? "Server error" : client ? "Client error" : "Success"}
    >
      {status}
    </span>
  );
}
