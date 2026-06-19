import { NotFoundError } from '../../shared/utils/errors';
import { SavedLocationModel, type ISavedLocation } from './location.model';
import type {
  CreateLocationDto,
  LocationResponseDto,
  UpdateLocationDto,
} from './location.validator';

function mapLocation(loc: ISavedLocation): LocationResponseDto {
  return {
    id: loc.id,
    label: loc.label,
    type: loc.type,
    address: loc.address,
    latitude: loc.latitude,
    longitude: loc.longitude,
    isDefault: loc.isDefault,
    createdAt: loc.createdAt.toISOString(),
  };
}

export class LocationService {
  async list(userId: string): Promise<LocationResponseDto[]> {
    const locations = await SavedLocationModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    return locations.map(mapLocation);
  }

  async create(userId: string, dto: CreateLocationDto): Promise<LocationResponseDto> {
    if (dto.isDefault) {
      await SavedLocationModel.updateMany({ userId }, { isDefault: false });
    }

    const location = await SavedLocationModel.create({
      userId,
      ...dto,
    });
    return mapLocation(location);
  }

  async update(
    userId: string,
    locationId: string,
    dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    if (dto.isDefault) {
      await SavedLocationModel.updateMany({ userId }, { isDefault: false });
    }

    const location = await SavedLocationModel.findOneAndUpdate(
      { _id: locationId, userId },
      dto,
      { new: true },
    );

    if (!location) {
      throw new NotFoundError('Location not found');
    }

    return mapLocation(location);
  }

  async remove(userId: string, locationId: string): Promise<void> {
    const result = await SavedLocationModel.findOneAndDelete({ _id: locationId, userId });
    if (!result) {
      throw new NotFoundError('Location not found');
    }
  }
}

export const locationService = new LocationService();
