import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="error-state">
    <div className="max-w-md w-full p-10 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] text-center">
      <div className="flex justify-center mb-5">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40">
          <AlertCircle className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
        </div>
      </div>

      <h3
        className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Something went wrong
      </h3>
      <p
        className="text-sm text-slate-500 dark:text-slate-400 mb-7 leading-relaxed"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {error || 'Unable to process your request. Make sure the backend server is running.'}
      </p>

      <button
        onClick={onRetry}
        className="w-full py-3.5 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        data-testid="retry-button"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ErrorState;
