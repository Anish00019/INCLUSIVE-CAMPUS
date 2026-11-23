import { ResponsiveContainer, ComposedChart, PolarAngleAxis, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts';
import { useA11y } from '../../context/AccessibilityContext';

const PALETTE = ['#1d4ed8', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e'];

function useChartTheme() {
  const { prefs } = useA11y();
  const dark = prefs.theme === 'dark' || prefs.highContrast;
  return {
    grid: dark ? 'rgba(255,255,255,.10)' : 'rgba(15,23,42,.07)',
    tick: dark ? '#94a3b8' : '#64748b',
    tooltip: {
      backgroundColor: dark ? '#0f172a' : '#ffffff',
      border: `1px solid ${dark ? 'rgba(255,255,255,.15)' : 'rgba(15,23,42,.1)'}`,
      borderRadius: 12, fontSize: 12, padding: '8px 10px',
      color: dark ? '#f1f5f9' : '#0f172a',
      boxShadow: '0 10px 30px -12px rgba(15,23,42,.35)',
    },
  };
}

/* Academic performance: student GPA vs class average */
export function PerformanceChart({ data, height = 240 }) {
  const theme = useChartTheme();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={theme.grid} />
          <XAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} dataKey="month" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} width={34} domain={[6, 10]} />
          <Tooltip contentStyle={theme.tooltip} cursor={{ stroke: theme.grid }} />
          <Area isAnimationActive={false} type="monotone" dataKey="gpa" name="Your GPA" stroke="#1d4ed8" strokeWidth={2.5} fill="url(#gpaGrad)" activeDot={{ r: 4 }} />
          <Line isAnimationActive={false} type="monotone" dataKey="classAvg" name="Class average" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: theme.tick, paddingTop: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Attendance trend */
export function AttendanceTrendChart({ data, height = 220 }) {
  const theme = useChartTheme();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={theme.grid} />
          <XAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} dataKey="month" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} width={34} domain={[70, 100]} unit="%" />
          <Tooltip contentStyle={theme.tooltip} formatter={(v) => [`${v}%`, 'Attendance']} />
          <Line isAnimationActive={false} type="monotone" dataKey="percentage" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Department comparison bars */
export function DepartmentBarChart({ data, height = 260 }) {
  const theme = useChartTheme();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke={theme.grid} />
          <XAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} dataKey="dept" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} width={34} />
          <Tooltip contentStyle={theme.tooltip} cursor={{ fill: 'rgba(29,78,216,.05)' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: theme.tick, paddingTop: 6 }} />
          <Bar isAnimationActive={false} dataKey="students" name="Total students" fill="#1d4ed8" radius={[6, 6, 0, 0]} maxBarSize={34} />
          <Bar isAnimationActive={false} dataKey="supported" name="With support" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Requests vs resolved */
export function RequestTrendChart({ data, height = 260 }) {
  const theme = useChartTheme();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={theme.grid} />
          <XAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} dataKey="month" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} width={34} />
          <Tooltip contentStyle={theme.tooltip} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: theme.tick, paddingTop: 6 }} />
          <Area isAnimationActive={false} type="monotone" dataKey="requests" name="New requests" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#reqGrad)" />
          <Area isAnimationActive={false} type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2.5} fill="url(#resGrad)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Donut / pie */
export function CategoryPieChart({ data, height = 240, innerRadius = 58, outerRadius = 88 }) {
  const theme = useChartTheme();
  return (
    <div role="img" aria-label={data.map(d=>`${d.name}: ${d.value}`).join('; ')} style={{ width: '100%', height }}><div style={{height}}>
      <ResponsiveContainer>
        <PieChart>
          <Pie role="presentation" isAnimationActive={false} data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={3} stroke="none">
            {data.map((d, i) => <Cell key={d.name} role="img" aria-label={`${d.name}: ${d.value}`} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip contentStyle={theme.tooltip} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: theme.tick }} />
        </PieChart>
      </ResponsiveContainer></div>
    </div>
  );
}

export function AttendanceDonut({ percentage = 92, height = 170 }) {
  const theme = useChartTheme();
  const data = [{ name: 'Attended', value: percentage, fill: '#1d4ed8' }, { name: 'Missed', value: 100 - percentage, fill: theme.grid }];
  return (
    <div style={{ width: '100%', height }}>
      <div aria-hidden="true" style={{height}}><ResponsiveContainer>
        <RadialBarChart data={[{ value: percentage, fill: '#1d4ed8' }]} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar isAnimationActive={false} dataKey="value" cornerRadius={20} background={{ fill: theme.grid }} />
          <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="22" fontWeight="800">{percentage}%</text>
          <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill={theme.tick} fontSize="10">attendance</text>
        </RadialBarChart>
      </ResponsiveContainer></div>
      <span className="sr-only">Attendance {percentage} percent. {data[1].value} percent missed.</span>
    </div>
  );
}

/* Horizontal bars for subject-wise attendance */
export function SubjectBarChart({ data, height = 260 }) {
  const theme = useChartTheme();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart accessibilityLayer data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={theme.grid} />
          <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} width={96} />
          <Tooltip contentStyle={theme.tooltip} formatter={(v) => [`${v}%`, 'Attendance']} cursor={{ fill: 'rgba(29,78,216,.05)' }} />
          <Bar isAnimationActive={false} dataKey="percentage" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {data.map((d) => <Cell key={d.name} fill={d.percentage >= 85 ? '#10b981' : d.percentage >= 75 ? '#f59e0b' : '#f43f5e'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ApprovalBarChart({ data, height = 240 }) {
  const theme = useChartTheme();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={theme.grid} />
          <XAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} dataKey="dept" />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.tick, fontSize: 11 }} width={34} domain={[0, 100]} unit="%" />
          <Tooltip contentStyle={theme.tooltip} formatter={(v) => [`${v}%`, 'Approval rate']} cursor={{ fill: 'rgba(29,78,216,.05)' }} />
          <Bar isAnimationActive={false} dataKey="approval" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { PALETTE };
