import { unwrapApi, api } from './api';
import type { Brand, ServiceCategory } from '../types/models';

export async function getServices(): Promise<ServiceCategory[]> {
  return unwrapApi(api.get('/api/v1/services'));
}

export async function getBrand(): Promise<Brand> {
  return unwrapApi(api.get('/api/v1/brand'));
}
