import { Clock, AlertTriangle, CheckCircle, Lightbulb, BarChart3, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const Card = ({ children, className = '', testId }) => (
  <div
    className={`p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-md transition-all duration-300 ${className}`}
    data-testid={testId}
  >
    {children}
  </div>
);

const SectionLabel = ({ icon, children }) => (
  <div className="flex items-center gap-2.5 mb-4">
    {icon}
    <span
      className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {children}
    </span>
  </div>
);

const PriorityConfig = {
  High: {
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    icon: <ShieldAlert className="w-5 h-5" />,
    dot: 'bg-rose-500',
  },
  Medium: {
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    icon: <AlertTriangle className="w-5 h-5" />,
    dot: 'bg-amber-500',
  },
  Low: {
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    icon: <ShieldCheck className="w-5 h-5" />,
    dot: 'bg-emerald-500',
  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg text-sm"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-0.5">{label}</p>
        <p className="text-emerald-600 dark:text-emerald-400">Score: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const ResultDashboard = ({ result, onNewPrediction }) => {
  const { wait_time, priority, probability_long_wait, recommendations, insights, feature_importance } = result;
  const cfg = PriorityConfig[priority] || PriorityConfig.Low;

  const barColors = feature_importance.map((_, i) =>
    ['#10b981', '#059669', '#047857', '#34d399'][i % 4]
  );

  return (
    <div className="max-w-5xl mx-auto" data-testid="result-dashboard">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-1"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Prediction Results
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Based on the information you provided
        </p>
      </div>

      {/* Top row: Wait time + Priority + Probability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {/* Wait time */}
        <Card testId="wait-time-card">
          <SectionLabel icon={<Clock className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />}>
            Estimated Wait
          </SectionLabel>
          <div
            className="text-6xl font-semibold text-slate-900 dark:text-slate-50 leading-none mb-1"
            data-testid="wait-time-result"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {wait_time}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
            minutes
          </div>
        </Card>

        {/* Priority */}
        <Card testId="priority-card">
          <SectionLabel icon={<AlertTriangle className="w-4 h-4 text-slate-500" strokeWidth={1.5} />}>
            Priority Level
          </SectionLabel>
          <div
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold ${cfg.badge}`}
            data-testid="priority-badge"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {cfg.icon}
            {priority} Priority
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {priority === 'High' ? 'Immediate attention required' : priority === 'Medium' ? 'Monitor closely' : 'Routine care'}
            </span>
          </div>
        </Card>

        {/* Long-wait probability */}
        <Card testId="probability-card">
          <SectionLabel icon={<BarChart3 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />}>
            Long-Wait Probability
          </SectionLabel>
          <div className="flex items-end gap-1 mb-3">
            <span
              className="text-5xl font-semibold text-slate-900 dark:text-slate-50 leading-none"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {Math.round(probability_long_wait * 100)}
            </span>
            <span className="text-xl text-slate-400 pb-1">%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.round(probability_long_wait * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2" style={{ fontFamily: "'Manrope', sans-serif" }}>
            Predicted by Random Forest model
          </p>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="mb-5" testId="recommendations-card">
        <SectionLabel icon={<Lightbulb className="w-4 h-4 text-amber-500" strokeWidth={1.5} />}>
          Recommendations
        </SectionLabel>
        <ul className="space-y-2.5">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Insights */}
      <Card className="mb-5" testId="insights-card">
        <SectionLabel icon={<Lightbulb className="w-4 h-4 text-purple-500" strokeWidth={1.5} />}>
          Model Insights
        </SectionLabel>
        <p
          className="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {insights}
        </p>
      </Card>

      {/* Feature Importance Chart */}
      <Card className="mb-8" testId="feature-importance-chart">
        <SectionLabel icon={<BarChart3 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />}>
          Feature Importance
        </SectionLabel>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={feature_importance} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
            <XAxis
              dataKey="name" tick={{ fontFamily: "'Manrope', sans-serif", fontSize: 12 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: "'Manrope', sans-serif", fontSize: 12 }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {feature_importance.map((_, i) => (
                <Cell key={i} fill={barColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* New prediction button */}
      <div className="text-center">
        <button
          onClick={onNewPrediction}
          className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          data-testid="new-prediction-button"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <RefreshCw className="w-5 h-5" />
          New Prediction
        </button>
      </div>
    </div>
  );
};

export default ResultDashboard;
