import dotenv from 'dotenv';

import { connectDatabase, disconnectDatabase } from '../config/database';
import { brandRepository } from '../repositories/brand';
import { catalogRepository } from '../repositories/catalog';
import type { ICatalogService } from '../models/catalog';
import { logger } from '../utils/logger';

import brandData from './seed-data/brand.json';
import colorsData from './seed-data/colors.json';
import servicesData from './seed-data/services.json';

dotenv.config();

interface SeedCategory {
  id: 'towing' | 'driver' | 'roadside' | 'future';
  title: string;
  icon: string;
  description?: string;
  services: Array<{ id: string; label: string; description?: string }>;
}

async function seedServices(): Promise<number> {
  const categories = servicesData as SeedCategory[];
  const records: Partial<ICatalogService>[] = [];
  let sortOrder = 0;

  for (const category of categories) {
    for (const service of category.services) {
      records.push({
        slug: service.id,
        category: category.id,
        categoryTitle: category.title,
        categoryIcon: category.icon,
        categoryDescription: category.description,
        title: service.label,
        description: service.description,
        icon: category.icon,
        isActive: true,
        sortOrder: sortOrder++,
      });
    }
  }

  await catalogRepository.upsertMany(records);
  return records.length;
}

async function seedBrand(): Promise<void> {
  await brandRepository.upsertBrand({
    appName: brandData.name,
    productName: brandData.productName,
    website: brandData.website,
    tagline: brandData.tagline,
    description: brandData.description,
    location: brandData.location,
    supportPhone: brandData.phone,
    email: brandData.email,
    company: brandData.company,
    highlights: brandData.highlights,
    features: brandData.features,
    logo: '/assets/logo.png',
    primaryColor: colorsData.primary,
    secondaryColor: colorsData.secondary,
    colors: colorsData,
    isActive: true,
  });
}

async function runSeed(): Promise<void> {
  await connectDatabase();

  const serviceCount = await seedServices();
  await seedBrand();

  logger.info('Database seed completed', { services: serviceCount, brand: 1 });
  await disconnectDatabase();
}

runSeed().catch(async (error: Error) => {
  logger.error('Seed failed', { error: error.message });
  await disconnectDatabase();
  process.exit(1);
});
