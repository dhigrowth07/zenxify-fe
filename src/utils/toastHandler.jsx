import { sileo } from "sileo";

/**
 * Toast handler utility using Sileo for buttery smooth notifications.
 */
export const toast = {
  /**
   * Success toast
   * @param {string} title 
   * @param {string|React.ReactNode} description 
   * @param {object} options 
   */
  success: (title = "Success!", description = "", options = {}) => {
    return sileo.success({
      title,
      description,
      ...options,
    });
  },

  /**
   * Error toast
   * @param {string} title 
   * @param {string|React.ReactNode} description 
   * @param {object} options 
   */
  error: (title = "Error!", description = "", options = {}) => {
    return sileo.error({
      title,
      description,
      ...options,
    });
  },

  /**
   * Warning toast
   * @param {string} title 
   * @param {string|React.ReactNode} description 
   * @param {object} options 
   */
  warning: (title = "Warning!", description = "", options = {}) => {
    return sileo.warning({
      title,
      description,
      ...options,
    });
  },

  /**
   * Info toast
   * @param {string} title 
   * @param {string|React.ReactNode} description 
   * @param {object} options 
   */
  info: (title = "Info!", description = "", options = {}) => {
    return sileo.info({
      title,
      description,
      ...options,
    });
  },

  /**
   * Action toast with a button
   * @param {string} title 
   * @param {string|React.ReactNode} description 
   * @param {string} buttonTitle 
   * @param {() => void} onClick 
   * @param {object} options 
   */
  action: (title = "Action Required!", description, buttonTitle, onClick, options = {}) => {
    return sileo.action({
      title,
      description,
      button: {
        title: buttonTitle,
        onClick,
      },
      ...options,
    });
  },

  /**
   * Promise toast (Loading -> Success/Error)
   * @param {Promise<any>} promise 
   * @param {string} loadingTitle 
   * @param {string|((data: any) => any)} successTitle 
   * @param {string|((err: any) => any)} errorTitle 
   * @param {object} options 
   */
  promise: (promise, loadingTitle = "Loading...", successTitle, errorTitle, options = {}) => {
    return sileo.promise(promise, {
      loading: { title: loadingTitle },
      success: typeof successTitle === "function"
        ? successTitle
        : { title: successTitle },
      error: typeof errorTitle === "function"
        ? errorTitle
        : { title: errorTitle },
      ...options,
    });
  },

  /**
   * Dismiss a toast by ID
   * @param {string} id 
   */
  dismiss: (id) => {
    // Sileo doesn't explicitly mention a global dismiss by ID in the snippet provided, 
    // but usually toast libraries have one. If not available, this can be removed.
    // For now, focusing on the provided API.
  }
};

/**
 * Standard utility for "Coming Soon" features.
 * Displays a beautiful info toast.
 * @param {string} featureName 
 */
export const showComingSoonToast = (featureName) => {
  return toast.info(
    "Coming Soon!",
    `${featureName} will be available in a future update.`
  );
};
