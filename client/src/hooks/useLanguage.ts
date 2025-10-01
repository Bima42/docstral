import { useTranslation } from 'react-i18next';

type Language = 'fr' | 'en'

export function useLanguage() {
	const { i18n, t } = useTranslation();
  
	const currentLanguage = i18n.language as Language;
  
	const changeLanguage = (lang: Language) => {
		i18n.changeLanguage(lang);
	};
  
	const toggleLanguage = () => {
		const newLang = currentLanguage === 'fr' ? 'en' : 'fr';
		changeLanguage(newLang);
	};
  
	const getLanguageDisplay = () => {
		return currentLanguage.toUpperCase();
	};
  
	return {
		currentLanguage,
		changeLanguage,
		toggleLanguage,
		getLanguageDisplay,
		t, // Translation function
		isFrench: currentLanguage === 'fr',
		isEnglish: currentLanguage === 'en'
	};
}