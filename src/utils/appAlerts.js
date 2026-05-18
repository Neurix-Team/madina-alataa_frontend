const APP_ALERT_EVENT = 'madina:app-alert';

let alertSequence = 0;

const SUCCESS_HINTS = /(تم|نجاح|نجحت|بنجاح|تمت|اكتمل|اكتملت|حفظ|حُفظ|مقبول|موافقة|approved|success)/i;
const ERROR_HINTS = /(فشل|خطأ|تعذر|تعذّر|غير متوفر|غير مكتمل|لا يمكن|مرفوض|error|failed|invalid)/i;
const WARNING_HINTS = /(تنبيه|تحذير|يرجى|رجاء|انتبه|مطلوب|warning)/i;

export function inferAlertType(message = '') {
  const normalized = String(message || '').trim();
  if (!normalized) return 'info';
  if (ERROR_HINTS.test(normalized)) return 'danger';
  if (SUCCESS_HINTS.test(normalized)) return 'success';
  if (WARNING_HINTS.test(normalized)) return 'warning';
  return 'info';
}

function buildTitleForType(type) {
  switch (type) {
    case 'success':
      return 'تم بنجاح';
    case 'danger':
      return 'حدث خطأ';
    case 'warning':
      return 'تنبيه';
    default:
      return 'إشعار';
  }
}

function normalizeAlertOptions(input) {
  if (typeof input === 'string') {
    const type = inferAlertType(input);
    return {
      id: `app-alert-${++alertSequence}`,
      title: buildTitleForType(type),
      message: input,
      type,
      isConfirm: false,
      duration: type === 'danger' ? 5200 : 3800,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
    };
  }

  const type = input?.type || inferAlertType(input?.message || input?.title || '');

  return {
    id: input?.id || `app-alert-${++alertSequence}`,
    title: input?.title || buildTitleForType(type),
    message: input?.message || '',
    type,
    isConfirm: Boolean(input?.isConfirm),
    duration: input?.duration ?? (type === 'danger' ? 5200 : 3800),
    confirmText: input?.confirmText || 'تأكيد',
    cancelText: input?.cancelText || 'إلغاء',
    onConfirm: input?.onConfirm,
    onCancel: input?.onCancel,
  };
}

function dispatchAlert(options) {
  if (typeof window === 'undefined') {
    return Promise.resolve(options.isConfirm ? false : true);
  }

  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent(APP_ALERT_EVENT, {
        detail: {
          ...options,
          resolve,
        },
      })
    );

    if (!options.isConfirm) {
      resolve(true);
    }
  });
}

export function showAppAlert(input) {
  return dispatchAlert(normalizeAlertOptions(input));
}

export function showAppConfirm(input) {
  if (typeof input === 'string') {
    return showAppAlert({
      title: 'تأكيد الإجراء',
      message: input,
      type: 'warning',
      isConfirm: true,
      confirmText: 'تأكيد',
      cancelText: 'إلغاء',
    });
  }

  return showAppAlert({
    ...input,
    isConfirm: true,
    type: input?.type || 'warning',
  });
}

export function installBrowserAlertBridge() {
  if (typeof window === 'undefined' || window.__madinaAppAlertBridgeInstalled) {
    return;
  }

  const nativeAlert = window.alert?.bind(window);

  window.__madinaNativeAlert = nativeAlert;
  window.__madinaAppAlertBridgeInstalled = true;

  window.alert = (message) => {
    const normalizedMessage =
      typeof message === 'string'
        ? message
        : message == null
          ? ''
          : JSON.stringify(message);

    showAppAlert(normalizedMessage);
  };
}

export { APP_ALERT_EVENT };
