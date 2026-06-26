import { NotFoundError } from '../utils/errors';
import { brandRepository } from '../repositories/brand';
import type { IBrand } from '../models/brand';

export interface BrandResponseDto {
  name: string;
  productName: string;
  website: string;
  tagline: string;
  description: string;
  location: string;
  phone: string;
  phoneRaw: string;
  email: string;
  company: string;
  highlights: Array<{ id: string; value: string; label: string; icon: string }>;
  features: string[];
  colors: Record<string, string>;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
}

function mapBrand(brand: IBrand): BrandResponseDto {
  return {
    name: brand.appName,
    productName: brand.productName ?? brand.appName,
    website: brand.website ?? '',
    tagline: brand.tagline ?? '',
    description: brand.description ?? '',
    location: brand.location ?? '',
    phone: brand.supportPhone,
    phoneRaw: brand.supportPhone.replace(/\D/g, '').slice(-10),
    email: brand.email ?? '',
    company: brand.company ?? '',
    highlights: brand.highlights ?? [],
    features: brand.features ?? [],
    colors: brand.colors ?? {
      primary: brand.primaryColor,
      secondary: brand.secondaryColor,
    },
    logo: brand.logo,
    primaryColor: brand.primaryColor,
    secondaryColor: brand.secondaryColor,
  };
}

export class BrandService {
  async getBrand(): Promise<BrandResponseDto> {
    const brand = await brandRepository.findActive();
    if (!brand) {
      throw new NotFoundError('Brand configuration not found');
    }
    return mapBrand(brand);
  }
}

export const brandService = new BrandService();
