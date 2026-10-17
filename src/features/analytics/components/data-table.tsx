/**
 * Collapsible plain table under a chart: the same numbers without hover,
 * for screen readers and for colours that are hard to tell apart.
 */
export function DataTable({
  summary,
  columns,
  rows,
}: {
  summary: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="group mt-3">
      <summary className="cursor-pointer select-none text-xs text-muted-foreground hover:text-foreground">
        {summary}
      </summary>
      <div className="mt-2 max-h-72 overflow-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c}
                  className={i === 0 ? "px-3 py-1.5 text-left font-medium text-muted-foreground" : "px-3 py-1.5 text-right font-medium text-muted-foreground"}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-border">
                {row.map((cell, ci) => (
                  <td key={ci} className={ci === 0 ? "px-3 py-1 text-foreground" : "px-3 py-1 text-right tabular-nums text-foreground"}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
