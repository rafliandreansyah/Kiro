import { describe, test, expect } from 'vitest';
import { validateTodoTitle, validateCategoryName } from '../../utils/validator';
import type { Category } from '../../types/index';

describe('validateTodoTitle', () => {
  test('judul kosong menghasilkan error', () => {
    const result = validateTodoTitle('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Judul tugas tidak boleh kosong');
  });

  test('judul hanya spasi menghasilkan error', () => {
    const result = validateTodoTitle('   ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Judul tugas tidak boleh kosong');
  });

  test('judul tepat 200 karakter valid', () => {
    const title = 'a'.repeat(200);
    const result = validateTodoTitle(title);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('judul 201 karakter invalid', () => {
    const title = 'a'.repeat(201);
    const result = validateTodoTitle(title);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Judul tugas maksimal 200 karakter');
  });

  test('judul normal valid', () => {
    const result = validateTodoTitle('Beli susu');
    expect(result.valid).toBe(true);
  });
});

describe('validateCategoryName', () => {
  const existing: Category[] = [
    { id: '1', name: 'Kerja' },
    { id: '2', name: 'Pribadi' },
  ];

  test('nama kosong menghasilkan error', () => {
    const result = validateCategoryName('', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Nama kategori tidak boleh kosong');
  });

  test('nama hanya spasi menghasilkan error', () => {
    const result = validateCategoryName('   ', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Nama kategori tidak boleh kosong');
  });

  test('duplikat exact-match menghasilkan error', () => {
    const result = validateCategoryName('Kerja', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Kategori dengan nama ini sudah ada');
  });

  test('duplikat case-insensitive menghasilkan error', () => {
    const result = validateCategoryName('kerja', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Kategori dengan nama ini sudah ada');
  });

  test('duplikat uppercase menghasilkan error', () => {
    const result = validateCategoryName('PRIBADI', existing);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Kategori dengan nama ini sudah ada');
  });

  test('nama baru unik valid', () => {
    const result = validateCategoryName('Belanja', existing);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('valid saat daftar kategori kosong', () => {
    const result = validateCategoryName('Kerja', []);
    expect(result.valid).toBe(true);
  });
});
