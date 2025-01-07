export const validateEmail = (email: string): string | undefined => {
    // Reguljärt uttryck för att matcha en giltig e-postadress
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Kontrollera om e-postadressen matchar reguljära uttrycket
    if (!emailRegex.test(email)) {
      return 'Invalid format on email'
    }
  };

  export const validatePassword = (password: string): string | undefined => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
  }
