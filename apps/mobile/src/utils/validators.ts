export const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
export const isValidPhone = (phone: string) => /^\+?[0-9]{10,14}$/.test(phone);
