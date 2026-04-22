import { Category, FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  categories: Category[];
  onChange: (f: Partial<FilterState>) => void;
  onReset: () => void;
}

export default function FilterBar({ filter, categories, onChange, onReset }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Status */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-status" className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Status
        </label>
        <select
          id="filter-status"
          aria-label="Filter berdasarkan status"
          value={filter.status}
          onChange={(e) => onChange({ status: e.target.value as FilterState['status'] })}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Semua">Semua</option>
          <option value="Belum Selesai">Belum Selesai</option>
          <option value="Selesai">Selesai</option>
        </select>
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-priority" className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Prioritas
        </label>
        <select
          id="filter-priority"
          aria-label="Filter berdasarkan prioritas"
          value={filter.priority}
          onChange={(e) => onChange({ priority: e.target.value as FilterState['priority'] })}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Semua">Semua</option>
          <option value="Rendah">Rendah</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-category" className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Kategori
        </label>
        <select
          id="filter-category"
          aria-label="Filter berdasarkan kategori"
          value={filter.category ?? ''}
          onChange={(e) => onChange({ category: e.target.value === '' ? null : e.target.value })}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
        <label htmlFor="filter-search" className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Cari
        </label>
        <input
          id="filter-search"
          type="text"
          aria-label="Cari tugas berdasarkan judul"
          placeholder="Cari tugas..."
          value={filter.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reset */}
      <div className="flex flex-col justify-end">
        <button
          type="button"
          aria-label="Reset semua filter"
          onClick={onReset}
          className="px-4 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset Filter
        </button>
      </div>
    </div>
  );
}
