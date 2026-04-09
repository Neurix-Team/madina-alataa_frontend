// src/utils/errorHandling.js

// Public error messages - safe for user display
export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  AUTH_EMAIL_EXISTS: 'هذا البريد الإلكتروني مسجل بالفعل',
  AUTH_INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  AUTH_WEAK_PASSWORD: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  AUTH_MISSING_NAME: 'الاسم مطلوب',
  AUTH_MISSING_ROLE: 'يجب اختيار الدور',
  AUTH_SESSION_EXPIRED: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
  AUTH_GUEST_FAILED: 'تعذر تسجيل الدخول كزائر',

  // File upload errors
  FILE_INVALID_TYPE: 'نوع الملف غير مدعوم. يرجى اختيار صورة من نوع JPG أو PNG أو WEBP',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت',
  FILE_UPLOAD_FAILED: 'فشل في رفع الملف، يرجى المحاولة مرة أخرى',

  // Avatar errors
  AVATAR_SAVE_FAILED: 'فشل في حفظ الإعدادات، يرجى المحاولة مرة أخرى',
  AVATAR_LOAD_FAILED: 'فشل في تحميل الإعدادات',

  // Settings errors
  SETTINGS_SAVE_FAILED: 'فشل في حفظ الإعدادات، يرجى المحاولة مرة أخرى',
  SETTINGS_INVALID_DATA: 'البيانات المدخلة غير صحيحة',

  // Location errors
  LOCATION_NOT_SUPPORTED: 'المتصفح لا يدعم تحديد الموقع',
  LOCATION_ACCESS_DENIED: 'تم رفض الوصول للموقع، يرجى السماح بالوصول',
  LOCATION_TIMEOUT: 'انتهت مهلة تحديد الموقع، يرجى المحاولة مرة أخرى',

  // Network errors
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت، يرجى التحقق من الاتصال',
  SERVER_ERROR: 'خطأ في الخادم، يرجى المحاولة لاحقاً',

  // Generic errors
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
  VALIDATION_ERROR: 'يرجى تصحيح الأخطاء الموجودة',
};

// Error handler function
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);

  // Return appropriate public error message
  if (error?.message) {
    // Map internal errors to public messages
    const message = error.message.toLowerCase();

    if (message.includes('invalid email') || message.includes('email')) {
      return ERROR_MESSAGES.AUTH_INVALID_EMAIL;
    }
    if (message.includes('password') || message.includes('credentials')) {
      return ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS;
    }
    if (message.includes('exists') || message.includes('duplicate')) {
      return ERROR_MESSAGES.AUTH_EMAIL_EXISTS;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (message.includes('file') || message.includes('upload')) {
      return ERROR_MESSAGES.FILE_UPLOAD_FAILED;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Safe error logging (doesn't expose sensitive data)
export const logError = (error, context = '', userId = null) => {
  const safeError = {
    message: error?.message || 'Unknown error',
    context,
    timestamp: new Date().toISOString(),
    userId: userId ? '[REDACTED]' : null,
    // Don't log stack traces or sensitive data
  };

  console.error('Application Error:', safeError);
};