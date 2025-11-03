export const SecurityUtils = {
    // Rate limiting check
    checkRateLimit: (address, action) => {
      const key = `${address}_${action}_${new Date().toDateString()}`;
      const attempts = parseInt(localStorage.getItem(key) || '0');
      const maxAttempts = 10; // Max 10 attempts per day
      
      if (attempts >= maxAttempts) {
        throw new Error('Daily rate limit exceeded');
      }
      
      localStorage.setItem(key, (attempts + 1).toString());
      return true;
    },
    
    // Validate wallet signature
    validateSignature: async (message, signature, expectedAddress) => {
      try {
        const recovered = ethers.utils.verifyMessage(message, signature);
        return recovered.toLowerCase() === expectedAddress.toLowerCase();
      } catch {
        return false;
      }
    },
    
    // Generate secure nonce
    generateNonce: () => {
      return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  };
  