import { analytics } from './firebase';
import { 
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties 
} from 'firebase/analytics';

// Função helper para verificar se analytics está disponível
const isAnalyticsAvailable = () => {
  return typeof window !== 'undefined' && analytics !== undefined;
};

// Eventos personalizados
export const AnalyticsEvents = {
  // Autenticação
  SIGNUP: 'signup',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Produtos
  VIEW_PRODUCT: 'view_product',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  SEARCH_PRODUCTS: 'search_products',
  
  // Reviews
  CREATE_REVIEW: 'create_review',
  VIEW_REVIEWS: 'view_reviews',
  
  // Navegação
  PAGE_VIEW: 'page_view',
  
  // PWA
  PWA_INSTALL: 'pwa_install',
  PWA_PROMPT: 'pwa_prompt',
} as const;

// Tipo para parâmetros dos eventos
type EventParams = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Registra um evento no Firebase Analytics
 */
export function logEvent(eventName: string, params?: EventParams) {
  if (!isAnalyticsAvailable()) {
    console.log('[Analytics] Event:', eventName, params);
    return;
  }
  
  try {
    firebaseLogEvent(analytics!, eventName, params);
  } catch (error) {
    console.error('[Analytics] Error logging event:', error);
  }
}

/**
 * Define o ID do usuário
 */
export function setUserId(userId: string | null) {
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseSetUserId(analytics!, userId);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
}

/**
 * Define propriedades do usuário
 */
export function setUserProperties(properties: { [key: string]: string | number | boolean }) {
  if (!isAnalyticsAvailable()) return;
  
  try {
    firebaseSetUserProperties(analytics!, properties);
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
}

// Eventos específicos com tipagem

export function trackPageView(pagePath: string, pageTitle: string) {
  logEvent(AnalyticsEvents.PAGE_VIEW, {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

export function trackProductView(productId: string, productName: string, category: string) {
  logEvent(AnalyticsEvents.VIEW_PRODUCT, {
    product_id: productId,
    product_name: productName,
    category,
  });
}

export function trackProductCreate(productId: string, category: string) {
  logEvent(AnalyticsEvents.CREATE_PRODUCT, {
    product_id: productId,
    category,
  });
}

export function trackReviewCreate(productId: string, rating: number) {
  logEvent(AnalyticsEvents.CREATE_REVIEW, {
    product_id: productId,
    rating,
  });
}

export function trackSearch(searchTerm: string, category?: string, resultsCount?: number) {
  logEvent(AnalyticsEvents.SEARCH_PRODUCTS, {
    search_term: searchTerm,
    category: category || 'all',
    results_count: resultsCount || 0,
  });
}

export function trackAuth(action: 'signup' | 'login' | 'logout', method?: string) {
  const eventMap = {
    signup: AnalyticsEvents.SIGNUP,
    login: AnalyticsEvents.LOGIN,
    logout: AnalyticsEvents.LOGOUT,
  };
  
  logEvent(eventMap[action], {
    method: method || 'email',
  });
}

export function trackPWA(action: 'install' | 'prompt') {
  const eventMap = {
    install: AnalyticsEvents.PWA_INSTALL,
    prompt: AnalyticsEvents.PWA_PROMPT,
  };
  
  logEvent(eventMap[action]);
}

