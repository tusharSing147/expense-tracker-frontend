import type { Category } from '../types/expense'
import { api } from './client'

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/meta/categories')

  return response.data
}
