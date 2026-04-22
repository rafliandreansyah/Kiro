import { Todo } from '../types/index';

interface SummaryBarProps {
  todos: Todo[];
}

export default function SummaryBar({ todos }: SummaryBarProps) {
  const total = todos.length;
  const belumSelesai = todos.filter((t) => t.status === 'Belum Selesai').length;
  const selesai = todos.filter((t) => t.status === 'Selesai').length;

  return (
    <div className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow text-sm">
      <div className="flex flex-col items-center flex-1">
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{total}</span>
        <span className="text-gray-500 dark:text-gray-400">Total</span>
      </div>
      <div className="w-px bg-gray-200 dark:bg-gray-600" />
      <div className="flex flex-col items-center flex-1">
        <span className="text-2xl font-bold text-yellow-500">{belumSelesai}</span>
        <span className="text-gray-500 dark:text-gray-400">Belum Selesai</span>
      </div>
      <div className="w-px bg-gray-200 dark:bg-gray-600" />
      <div className="flex flex-col items-center flex-1">
        <span className="text-2xl font-bold text-green-500">{selesai}</span>
        <span className="text-gray-500 dark:text-gray-400">Selesai</span>
      </div>
    </div>
  );
}
