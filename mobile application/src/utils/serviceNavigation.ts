import { isComingSoonServiceId } from '../constants/comingSoonServices';

type ServiceCategoryNavigation = {
  navigate: (screen: string, params?: object) => void;
};

export function openServiceCategory(
  navigation: ServiceCategoryNavigation,
  categoryId: string,
  categoryTitle: string,
) {
  if (categoryId === 'towing') {
    navigation.navigate('TowingService');
    return;
  }

  if (categoryId === 'driver') {
    navigation.navigate('DriverService');
    return;
  }

  if (categoryId === 'roadside') {
    navigation.navigate('RoadsideAssistance');
    return;
  }

  if (categoryId === 'future') {
    navigation.navigate('MoreServices');
    return;
  }

  if (isComingSoonServiceId(categoryId)) {
    navigation.navigate('ServiceComingSoon', { serviceId: categoryId });
    return;
  }

  navigation.navigate('ServiceList', { categoryId, categoryTitle });
}
