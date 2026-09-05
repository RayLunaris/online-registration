import React, { useState } from 'react';
import { Search, ArrowRight, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PublicLeaderboardEntry, Major } from '@/types/spmb';

interface SearchResultInfo {
  type: 'current' | 'other' | 'not_found';
  entry?: PublicLeaderboardEntry;
  targetMajor?: Major;
  message: string;
}

interface SearchMyRankProps {
  onSearch: (regNumber: string) => {
    entry: PublicLeaderboardEntry | undefined;
    isInCurrentMajor: boolean;
    targetMajor: Major | undefined;
  };
  onSwitchMajorAndHighlight: (majorId: string, regNumber: string) => void;
  onHighlightInCurrentMajor: (regNumber: string) => void;
}

export const SearchMyRank: React.FC<SearchMyRankProps> = ({
  onSearch,
  onSwitchMajorAndHighlight,
  onHighlightInCurrentMajor,
}) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResultInfo | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResult({
        type: 'not_found',
        message: 'Silakan masukkan nomor pendaftaran Anda.',
      });
      return;
    }

    const searchRes = onSearch(trimmed);

    if (searchRes.entry && searchRes.isInCurrentMajor) {
      setResult({
        type: 'current',
        entry: searchRes.entry,
        message: `Nomor pendaftaran ${searchRes.entry.registration_number} ditemukan: Peringkat #${searchRes.entry.rank_in_major} (${searchRes.entry.is_within_quota ? 'Dalam Kuota' : 'Di Luar Kuota'}).`,
      });
      onHighlightInCurrentMajor(searchRes.entry.registration_number);
    } else if (searchRes.entry && searchRes.targetMajor) {
      setResult({
        type: 'other',
        entry: searchRes.entry,
        targetMajor: searchRes.targetMajor,
        message: `Nomor pendaftaran ditemukan di jurusan ${searchRes.targetMajor.name} (Peringkat #${searchRes.entry.rank_in_major}).`,
      });
    } else {
      setResult({
        type: 'not_found',
        message: `Nomor pendaftaran "${trimmed}" tidak ditemukan atau belum diproses dalam seleksi.`,
      });
    }
  };

  const handleSwitchTab = () => {
    if (result?.entry && result?.targetMajor) {
      onSwitchMajorAndHighlight(result.targetMajor.id, result.entry.registration_number);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Search className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Cari Posisi Saya
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ketik nomor pendaftaran Anda untuk langsung menyorot posisi dan peringkat Anda di tabel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-xl">
        <div className="relative flex-1">
          <label htmlFor="search-my-rank-input" className="sr-only">Nomor Pendaftaran</label>
          <Input
            id="search-my-rank-input"
            name="registration_number"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (result) setResult(null);
            }}
            placeholder="Nomor Pendaftaran (misal: REG-2026-00001)"
            className="bg-slate-50/70 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-mono pr-8 text-slate-900 dark:text-slate-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResult(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 h-9 shrink-0 gap-1.5 shadow-2xs"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Cari Posisi</span>
        </Button>
      </form>

      {/* Result Messages */}
      {result && (
        <div className="pt-2 animate-in fade-in duration-200">
          {result.type === 'current' && (
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}

          {result.type === 'other' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{result.message}</span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleSwitchTab}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3 gap-1 shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <span>Pindah ke Jurusan {result.targetMajor?.code || ''}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}

          {result.type === 'not_found' && (
            <div className="flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-lg p-3">
              <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
