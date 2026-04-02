import { useState } from 'react';
import { UserCircle, Activity, Users, Stethoscope, Star } from 'lucide-react';

const SYMPTOMS = [
  'Chest Pain',
  'Difficulty Breathing',
  'Severe Headache',
  'Abdominal Pain',
  'Fever',
  'Injury/Trauma',
  'Dizziness',
  'Vomiting',
  'Bleeding',
  'Unconsciousness',
];

const GENDERS = ['Male', 'Female', 'Other'];
const RACES = ['White', 'Black', 'Hispanic', 'Asian', 'Native American', 'Pacific Islander', 'Other'];
const DEPARTMENTS = ['None', 'General Practice', 'Orthopedics', 'Gastroenterology', 'Neurology', 'Renal', 'Physiotherapy'];

const Label = ({ children, className = '' }) => (
  <label
    className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ${className}`}
    style={{ fontFamily: "'Manrope', sans-serif" }}
  >
    {children}
  </label>
);

const Select = ({ value, onChange, options, placeholder, testId }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    data-testid={testId}
    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
    style={{ fontFamily: "'Manrope', sans-serif" }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => (
      <option key={o} value={o}>{o}</option>
    ))}
  </select>
);

const InputForm = ({ onSubmit }) => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [race, setRace] = useState('Other');
  const [department, setDepartment] = useState('None');
  const [severity, setSeverity] = useState(5);
  const [crowd, setCrowd] = useState(5);
  const [satisfaction, setSatisfaction] = useState(3);
  const [symptoms, setSymptoms] = useState([]);

  const toggleSymptom = (s) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ age: parseInt(age), gender, race, department, severity, crowd, satisfaction_score: satisfaction, symptoms });
  };

  const SliderRow = ({ label, icon, value, onChange, min = 1, max = 10, low, high, testId, color }) => (
    <div className="mb-6">
      <Label>
        {icon}
        {label}: <span className={`ml-1 font-bold ${color || 'text-emerald-600 dark:text-emerald-400'}`}>{value}/10</span>
      </Label>
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        data-testid={testId}
        className="w-full h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between mt-1 text-xs text-slate-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <span>{low}</span><span>{high}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-1"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Patient Information
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Fill in the details below for an accurate wait time prediction.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Demographics card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Demographics
          </h3>

          {/* Age */}
          <div className="mb-5">
            <Label><UserCircle className="w-4 h-4" /> Age</Label>
            <input
              type="number" min="1" max="120" value={age} required
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 34"
              data-testid="age-input"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Gender</Label>
              <Select value={gender} onChange={setGender} options={GENDERS} testId="gender-select" />
            </div>
            <div>
              <Label>Race / Ethnicity</Label>
              <Select value={race} onChange={setRace} options={RACES} testId="race-select" />
            </div>
            <div>
              <Label><Stethoscope className="w-4 h-4" /> Department Referral</Label>
              <Select value={department} onChange={setDepartment} options={DEPARTMENTS} testId="department-select" />
            </div>
          </div>
        </div>

        {/* Clinical card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-5" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Clinical Details
          </h3>

          <SliderRow
            label="Symptom Severity" icon={<Activity className="w-4 h-4" />}
            value={severity} onChange={setSeverity}
            low="Mild" high="Critical" testId="severity-slider"
            color={severity >= 7 ? 'text-rose-500' : severity >= 4 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}
          />
          <SliderRow
            label="Hospital Crowd Level" icon={<Users className="w-4 h-4" />}
            value={crowd} onChange={setCrowd}
            low="Quiet" high="Packed" testId="crowd-slider"
          />
          <SliderRow
            label="Your Satisfaction Score (prior visit)" icon={<Star className="w-4 h-4" />}
            value={satisfaction} onChange={setSatisfaction} min={1} max={5}
            low="Poor" high="Excellent" testId="satisfaction-slider"
          />

          {/* Symptoms */}
          <div>
            <Label>Presenting Symptoms <span className="normal-case text-emerald-600 dark:text-emerald-400 font-normal ml-1">({symptoms.length} selected)</span></Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYMPTOMS.map(s => (
                <label
                  key={s}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 text-sm select-none
                    ${symptoms.includes(s)
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(s)}
                    onChange={() => toggleSymptom(s)}
                    className="accent-emerald-500 w-4 h-4"
                    data-testid={`symptom-${s.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-4 text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          data-testid="submit-patient-data-button"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Predict Wait Time
        </button>
      </form>
    </div>
  );
};

export default InputForm;
