/**
 * Dynamic loader for Razorpay checkout SDK
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // If Razorpay script is already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Utility to launch a Razorpay Payment window
 * @param {Object} config - Configuration parameters
 * @param {number} config.amount - Amount in Rupees (will be converted to Paise automatically)
 * @param {string} config.email - Prefill email
 * @param {string} config.phone - Prefill contact number
 * @param {string} config.name - Prefill user name
 * @param {string} [config.description] - Payment description
 * @param {string} [config.orderId] - Razorpay API Order ID (optional, generated on server)
 * @param {Function} onSuccess - Success callback (returns payment info response)
 * @param {Function} [onDismiss] - Dismiss/close callback
 */
export const initializeRazorpayPayment = async (config, onSuccess, onDismiss) => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

  const options = {
    key: razorpayKey,
    amount: Math.round(config.amount * 100), // convert to paise
    currency: 'INR',
    name: 'Nuzvid Agri Farms',
    description: config.description || 'Order Checkout Payment',
    image: 'https://www.nuzvidagrifarms.com/cdn/shop/files/Our_Intro_1200x.jpg?v=1759857682', // logo URL
    handler: function (response) {
      if (onSuccess) {
        onSuccess(response);
      }
    },
    prefill: {
      name: config.name || '',
      email: config.email || '',
      contact: config.phone || '',
    },
    notes: {
      address: config.address || '',
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      }
    },
    theme: {
      color: '#3C1C14', // Brand primary color
    },
  };

  if (config.orderId) {
    options.order_id = config.orderId;
  }

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
