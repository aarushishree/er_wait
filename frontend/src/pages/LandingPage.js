import { useNavigate } from 'react-router-dom';
import { Activity, Clock, TrendingUp, Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-sm"
          data-testid="theme-toggle-button"
        >
          {theme === 'dark'
            ? <Sun className="w-5 h-5 text-emerald-500" />
            : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      <div className="container mx-auto px-6 py-20 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <Activity className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-slate-50 mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            ER Wait Time
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">Predictor</span>
          </h1>

          <p
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            Enter patient details and get an instant ML-powered estimate of emergency room wait time and priority level.
          </p>

          <button
            onClick={() => navigate('/predictor')}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            data-testid="get-started-button"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <Clock className="w-5 h-5" />
            Check Wait Time
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-9 h-9 text-emerald-500" strokeWidth={1.5} />,
              title: 'Instant Prediction',
              desc: 'ML-powered estimates in seconds using a trained Random Forest model.'
            },
            {
              icon: <Activity className="w-9 h-9 text-emerald-500" strokeWidth={1.5} />,
              title: 'Priority Assessment',
              desc: 'Understand your triage level — Low, Medium, or High — based on symptoms and severity.'
            },
            {
              icon: <TrendingUp className="w-9 h-9 text-emerald-500" strokeWidth={1.5} />,
              title: 'Smart Insights',
              desc: 'Receive personalised recommendations and feature importance visualisations.'
            }
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-4">{icon}</div>
              <h3
                className="text-lg font-medium text-slate-900 dark:text-slate-50 mb-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {title}
              </h3>
              <p
                className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        
      </div>
    </div>
  );
};

export default LandingPage;
