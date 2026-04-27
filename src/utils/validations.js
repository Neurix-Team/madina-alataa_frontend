// src/utils/validations.js

import { ERROR_MESSAGES } from './errorHandling';

// Email validation
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return ERROR_MESSAGES.AUTH_INVALID_EMAIL;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return ERROR_MESSAGES.AUTH_INVALID_EMAIL;
  }

  return null; // Valid
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return ERROR_MESSAGES.AUTH_WEAK_PASSWORD;
  }

  if (password.length < 6) {
    return ERROR_MESSAGES.AUTH_WEAK_PASSWORD;
  }

  return null; // Valid
};

// Name validation
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return ERROR_MESSAGES.AUTH_MISSING_NAME;
  }

  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return ERROR_MESSAGES.AUTH_MISSING_NAME;
  }

  // Check for valid characters (Arabic, English, spaces)
  const nameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z\s]+$/;
  if (!nameRegex.test(trimmed)) {
    return 'الاسم يجب أن يحتوي على أحرف فقط';
  }

  return null; // Valid
};

// Role validation
export const validateRole = (role) => {
  const validRoles = ['donor', 'parent', 'volunteer', 'reviewer', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return ERROR_MESSAGES.AUTH_MISSING_ROLE;
  }

  return null; // Valid
};

// File validation
export const validateImageFile = (file) => {
  if (!file) {
    return 'لم يتم اختيار ملف';
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return ERROR_MESSAGES.FILE_INVALID_TYPE;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return 'امتداد الملف غير مدعوم';
  }

  if (file.size > maxSize) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  return null; // Valid
};

// Avatar profile validation
export const validateAvatarProfile = (profile) => {
  if (!profile || typeof profile !== 'object') {
    return 'بيانات الأفاتار غير صحيحة';
  }

  const errors = [];

  // Validate name
  if (profile.name) {
    const nameError = validateName(profile.name);
    if (nameError) errors.push(`الاسم: ${nameError}`);
  }

  // Validate gender
  if (profile.gender && !['boy', 'girl'].includes(profile.gender)) {
    errors.push('الجنس غير صحيح');
  }

  // Validate skin tone
  const validSkinTones = ['light', 'medium', 'tan', 'olive', 'brown', 'dark'];
  if (profile.skinTone && !validSkinTones.includes(profile.skinTone)) {
    errors.push('لون البشرة غير صحيح');
  }

  // Validate hair style
  const validHairStyles = ['short', 'medium', 'long', 'curly', 'wavy', 'braid', 'bun', 'ponytail'];
  if (profile.hairStyle && !validHairStyles.includes(profile.hairStyle)) {
    errors.push('تسريحة الشعر غير صحيحة');
  }

  // Validate hair color
  const validHairColors = ['black', 'brown', 'blonde', 'red', 'blue', 'purple', 'pink', 'green', 'silver', 'gold'];
  if (profile.hairColor && !validHairColors.includes(profile.hairColor)) {
    errors.push('لون الشعر غير صحيح');
  }

  // Validate accessories
  if (profile.accessories && Array.isArray(profile.accessories)) {
    const validAccessories = ['glasses', 'hat', 'crown', 'mask', 'flower', 'bow', 'headband', 'earrings', 'sunglasses', 'bandana'];
    const invalidAccessories = profile.accessories.filter(acc => !validAccessories.includes(acc));
    if (invalidAccessories.length > 0) {
      errors.push('بعض الإكسسوارات غير صحيحة');
    }
  }

  // Validate clothes
  const validClothes = ['tshirt', 'hoodie', 'jacket', 'dress', 'superhero', 'wizard', 'sport', 'formal'];
  if (profile.clothes && !validClothes.includes(profile.clothes)) {
    errors.push('الملابس غير صحيحة');
  }

  // Validate background
  const validBackgrounds = ['gradient1', 'gradient2', 'gradient3', 'gradient4', 'gradient5', 'stars', 'rainbow'];
  if (profile.background && !validBackgrounds.includes(profile.background)) {
    errors.push('الخلفية غير صحيحة');
  }

  return errors.length > 0 ? errors.join(', ') : null;
};

// Settings validation
export const validateSettings = (settings) => {
  if (!settings || typeof settings !== 'object') {
    return ERROR_MESSAGES.SETTINGS_INVALID_DATA;
  }

  const errors = [];

  // Validate full name
  if (settings.fullName) {
    const nameError = validateName(settings.fullName);
    if (nameError) errors.push(`الاسم: ${nameError}`);
  }

  // Validate email
  if (settings.email) {
    const emailError = validateEmail(settings.email);
    if (emailError) errors.push(`البريد الإلكتروني: ${emailError}`);
  }

  // Validate city (optional but if provided, check length)
  if (settings.city && settings.city.length > 100) {
    errors.push('اسم المدينة طويل جداً');
  }

  // Validate address (optional but if provided, check length)
  if (settings.address && settings.address.length > 500) {
    errors.push('العنوان طويل جداً');
  }

  // Validate coordinates
  if (settings.lat !== null && (settings.lat < -90 || settings.lat > 90)) {
    errors.push('خط العرض غير صحيح');
  }
  if (settings.lng !== null && (settings.lng < -180 || settings.lng > 180)) {
    errors.push('خط الطول غير صحيح');
  }

  return errors.length > 0 ? errors.join(', ') : null;
};

// Comprehensive form validation
export const validateForm = (formData, schema) => {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    const fieldErrors = [];

    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) {
        fieldErrors.push(error);
        break; // Stop at first error for this field
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};