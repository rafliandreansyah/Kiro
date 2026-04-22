import { SortState, SortField, SortDirection } from '../types';

interface SortBarProps {
  sort: SortState;
  onChange: (s: SortState) => void;
}

const fieldLabels: Record<SortField, string> = {
  createdAt: 'Tanggal Dibuat',
  dueDate: 'Tanggal Jatuh Tempo',
  priority: 'Prioritas',
};

const directionLabels: Record<SortDirection, string> = {
  asc: 'Terlama/Terendah',
  desc: 'Terbaru/Tertinggi',
};

export default function SortBar({ sort, onChange }: SortBarProps) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Sort Field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="sort-field" className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Urutkan Berdasarkan
        </label>
        <select
          id="sort-field"
          aria-label="Pilih kriteria pengurutan"
          value={sort.field}
          onChange={(e) => onChange({ ...sort, field: e.target.value as SortField })}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {(Object.keys(fieldLabels) as SortField[]).map((field) => (
            <option key={field} value={field}>
              {fieldLabels[field]}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Direction */}
      <div className="flex flex-col gap-1">
        <label htmlFor="sort-direction" className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Arah
        </label>
        <select
          id="sort-direction"
          aria-label="Pilih arah pengurutan"
          value={sort.direction}
          onChange={(e) => onChange({ ...sort, direction: e.target.value as SortDirection })}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {(Object.keys(directionLabels) as SortDirection[]).map((dir) => (
            <option key={dir} value={dir}>
              {directionLabels[dir]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
