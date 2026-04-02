import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import InputForm from '../components/InputForm';
import LoadingState from '../components/LoadingState';
import ResultDashboard from '../components/ResultDashboard';
import ErrorState from '../components/ErrorState';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PredictorPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [state, setState] = useState('form'); // 'form' | 'loading' | 'result' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setState('loading');
    try {
      const response = await fetch(`${BACKEND_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prediction failed');
      setResult(data);
      setState('result');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  };

  const handleReset = () => {
    setState('form');
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="container mx-auto px-6 py-5 max-w-6xl flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
          data-testid="back-to-home-button"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-sm"
          data-testid="theme-toggle-button"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-emerald-500" />
            : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 pb-16 max-w-6xl">
        {state === 'form'    && <InputForm onSubmit={handleSubmit} />}
        {state === 'loading' && <LoadingState />}
        {state === 'result'  && <ResultDashboard result={result} onNewPrediction={handleReset} />}
        {state === 'error'   && <ErrorState error={error} onRetry={handleReset} />}
      </div>
    </div>
  );
};

export default PredictorPage;
