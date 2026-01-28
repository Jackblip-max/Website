const TAB_ID_KEY = 'tab_id';
const TOKEN_KEY_PREFIX = 'token_';

/**
 * Generate or retrieve unique tab ID
 * Each browser tab gets its own unique identifier stored in sessionStorage
 */
const getTabId = () => {
  let tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(TAB_ID_KEY, tabId);
  }
  return tabId;
};

/**
 * Tab-specific authentication methods
 * Each tab maintains its own authentication token
 */
export const tabAuth = {
  /**
   * Store authentication token for current tab
   * @param {string} token - JWT authentication token
   */
  setToken: (token) => {
    const tabId = getTabId();
    sessionStorage.setItem(`${TOKEN_KEY_PREFIX}${tabId}`, token);
    // Also store in regular token key for backward compatibility
    sessionStorage.setItem('token', token);
  },
  
  /**
   * Retrieve authentication token for current tab
   * @returns {string|null} - JWT token or null if not found
   */
  getToken: () => {
    const tabId = getTabId();
    // Try tab-specific token first
    let token = sessionStorage.getItem(`${TOKEN_KEY_PREFIX}${tabId}`);
    // Fallback to regular token for backward compatibility
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    return token;
  },
  
  /**
   * Remove authentication token for current tab
   */
  removeToken: () => {
    const tabId = getTabId();
    sessionStorage.removeItem(`${TOKEN_KEY_PREFIX}${tabId}`);
    sessionStorage.removeItem('token');
  },

  /**
   * Get current tab ID
   * @returns {string} - Unique tab identifier
   */
  getTabId: () => {
    return getTabId();
  },

  /**
   * Clear all authentication data for current tab
   */
  clearTabAuth: () => {
    const tabId = getTabId();
    sessionStorage.removeItem(`${TOKEN_KEY_PREFIX}${tabId}`);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem(TAB_ID_KEY);
  }
};

export default tabAuth;


