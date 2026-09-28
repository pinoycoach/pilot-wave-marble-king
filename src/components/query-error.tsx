import { failMessage } from "@/lib/fail";

export function QueryError({ error, label }: { error: unknown; label: string }) {
  if (!error) return null;
  return (
    <p className="mt-3 text-sm text-clay">
      {label}: {failMessage(error)}
    </p>
  );
}
