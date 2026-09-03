import { Major } from '@/types/spmb';
import { cn } from '@/lib/utils';

interface MajorTabsProps {
  majors: Major[];
  selectedMajorId: string;
  onSelectMajor: (majorId: string) => void;
  entriesCountByMajor?: Record<string, number>;
}

export const MajorTabs: React.FC<MajorTabsProps> = ({
  majors,
  selectedMajorId,
  onSelectMajor,
  entriesCountByMajor = {},
}) => {
  if (majors.length === 0) return null;

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 overflow-x-auto pb-px scrollbar-none no-scrollbar -mb-px">
        {majors.map((major) => {
          const isSelected = major.id === selectedMajorId;
          const count = entriesCountByMajor[major.id];

          return (
            <button
              key={major.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectMajor(major.id)}
              className={cn(
                'group relative flex items-center gap-2.5 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2',
                isSelected
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-semibold bg-teal-50/50 dark:bg-teal-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
              )}
            >
              {/* Major Code Badge */}
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wider transition-colors',
                  isSelected
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                )}
              >
                {major.code}
              </span>

              {/* Major Full Name */}
              <span className="truncate max-w-[200px] sm:max-w-[260px]">
                {major.name}
              </span>

              {/* Quota / Count Pill */}
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.5 rounded-full border leading-none',
                  isSelected
                    ? 'border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                )}
                title={`Kuota: ${major.quota} siswa`}
              >
                {count !== undefined ? `${count} siswa` : `Kuota ${major.quota}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
