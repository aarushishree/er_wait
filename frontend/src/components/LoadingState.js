const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="loading-state">
    <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] text-center">
      {/* Animated pulse ring */}
      <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping" />
        <span className="relative inline-flex rounded-full h-14 w-14 bg-emerald-500 items-center justify-center">
          <svg className="w-7 h-7 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </span>
      </div>

      <p
        className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        Analysing patient data…
      </p>
      <p
        className="text-sm text-slate-500 dark:text-slate-400"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        Running the prediction model — just a moment.
      </p>
    </div>
  </div>
);

export default LoadingState;
