import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from 'recharts';
import { costByCategory, formatMoney } from '../lib/billing';
import type { Subscription } from '../types';

interface TooltipProps {
  active?: boolean;
  payload?: { payload: { category: string; monthly: number } }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const { category, monthly } = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--grid)] bg-[var(--surface)] px-3 py-2 text-xs shadow-sm">
      <div className="font-semibold text-[var(--ink)]">{category}</div>
      <div className="text-[var(--ink-2)]">{formatMoney(monthly)} / month</div>
    </div>
  );
}

export function CostChart({ subs }: { subs: Subscription[] }) {
  const data = costByCategory(subs);
  if (data.length === 0) {
    return <p className="text-sm text-[var(--ink-2)]">Add a subscription to see where your money goes.</p>;
  }

  return (
    <div>
      <div style={{ height: Math.max(140, data.length * 44 + 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 8 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} stroke="var(--grid)" strokeWidth={1} />
            <XAxis type="number" tickFormatter={(v: number) => `$${v}`} tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--axis)' }} tickLine={false} />
            <YAxis type="category" dataKey="category" width={120} tick={{ fill: 'var(--ink-2)', fontSize: 12 }} axisLine={{ stroke: 'var(--axis)' }} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--hover)' }} />
            <Bar dataKey="monthly" fill="var(--series-1)" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList dataKey="monthly" position="right" formatter={(v) => formatMoney(Number(v))} style={{ fill: 'var(--ink-2)', fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-[var(--ink-2)]">View as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-[var(--muted)]">
              <th className="py-1 font-medium">Category</th>
              <th className="py-1 text-right font-medium">Per month</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.category} className="border-t border-[var(--grid)] text-[var(--ink)]">
                <td className="py-1">{d.category}</td>
                <td className="py-1 text-right tabular-nums">{formatMoney(d.monthly)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
