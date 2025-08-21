import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook that wraps react-i18next's useTranslation
export function useTranslation(namespace?: string) {
  const { t, i18n } = useI18nTranslation(namespace);
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = i18n.language || 'ro';
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    isRomanian: currentLanguage === 'ro',
    isEnglish: currentLanguage === 'en',
  };
}

// Export for convenience
export const useCommonTranslation = () => useTranslation('common');
export const useNavigationTranslation = () => useTranslation('navigation');
export const useAuthTranslation = () => useTranslation('auth');
export const useAdminTranslation = () => useTranslation('admin');