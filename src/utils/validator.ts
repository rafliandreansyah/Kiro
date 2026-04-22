import type { Category } from '../types/index';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateTodoTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Judul tugas tidak boleh kosong' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Judul tugas maksimal 200 karakter' };
  }
  return { valid: true };
};

export const validateCategoryName = (
  name: string,
  existing: Category[]
): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Nama kategori tidak boleh kosong' };
  }
  const duplicate = existing.some(
    (cat) => cat.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return { valid: false, error: 'Kategori dengan nama ini sudah ada' };
  }
  return { valid: true };
};

const validator = { validateTodoTitle, validateCategoryName };
export default validator;
