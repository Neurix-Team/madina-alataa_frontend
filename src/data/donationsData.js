// src/data/donationsData.js

export const DONATION_STATUSES = {
  SUCCESS: 'successful',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHODS = {
  CARD: 'credit_card',
  BANK: 'bank_transfer',
  WALLET: 'wallet',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
};

export const DONATION_TYPES = {
  CASH: 'cash',
  SUPPLIES: 'supplies',
  MEDICAL: 'medical',
  EDUCATION: 'education',
  HOUSING: 'housing',
  EMERGENCY: 'emergency',
};

// Status configuration with colors and labels
export const STATUS_CONFIG = {
  successful: {
    label: 'ناجح',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: '✅',
  },
  pending: {
    label: 'قيد المعالجة',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: '⏳',
  },
  failed: {
    label: 'فشل',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: '❌',
  },
  refunded: {
    label: 'استرجاع',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: '↩️',
  },
};

// Donation type config
export const DONATION_TYPE_CONFIG = {
  cash: {
    label: 'نقدي',
    icon: '💵',
  },
  supplies: {
    label: 'مستلزمات',
    icon: '📦',
  },
  medical: {
    label: 'طبي',
    icon: '🏥',
  },
  education: {
    label: 'تعليمي',
    icon: '📚',
  },
  housing: {
    label: 'سكني',
    icon: '🏠',
  },
  emergency: {
    label: 'طواريء',
    icon: '🚨',
  },
};

// Payment method config
export const PAYMENT_METHOD_CONFIG = {
  credit_card: { label: 'بطاقة ائتمان', icon: '💳' },
  bank_transfer: { label: 'تحويل بنكي', icon: '🏦' },
  wallet: { label: 'محفظة التطبيق', icon: '👛' },
  apple_pay: { label: 'Apple Pay', icon: '🍎' },
  google_pay: { label: 'Google Pay', icon: '🔵' },
};

// Sample donations data
export const SAMPLE_DONATIONS = [
  {
    id: 'don-001',
    caseId: 'case-123',
    caseName: 'محمد احتاج دعم تعليمي',
    beneficiaryName: 'محمد أحمد',
    amount: 100,
    currency: 'SAR',
    type: DONATION_TYPES.EDUCATION,
    status: DONATION_STATUSES.SUCCESS,
    paymentMethod: PAYMENT_METHODS.CARD,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    receiptId: 'RCP-2024-001',
    notes: 'تبرع لدعم رسوم المدرسة',
  },
  {
    id: 'don-002',
    caseId: 'case-456',
    caseName: 'فاطمة تحتاج علاج صحي',
    beneficiaryName: 'فاطمة محمد',
    amount: 500,
    currency: 'SAR',
    type: DONATION_TYPES.MEDICAL,
    status: DONATION_STATUSES.SUCCESS,
    paymentMethod: PAYMENT_METHODS.BANK,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    receiptId: 'RCP-2024-002',
    notes: 'تبرع لدعم العلاج الطبي',
  },
  {
    id: 'don-003',
    caseId: 'case-789',
    caseName: 'عائلة أحتاج مساعدة سكنية',
    beneficiaryName: 'عم حسن',
    amount: 250,
    currency: 'SAR',
    type: DONATION_TYPES.HOUSING,
    status: DONATION_STATUSES.SUCCESS,
    paymentMethod: PAYMENT_METHODS.WALLET,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    receiptId: 'RCP-2024-003',
    notes: 'تبرع لمساعدة سكنية',
  },
  {
    id: 'don-004',
    caseId: 'case-101',
    caseName: 'كريستينا طفلة تحتاج مأكل',
    beneficiaryName: 'كريستينا',
    amount: 75,
    currency: 'SAR',
    type: DONATION_TYPES.CASH,
    status: DONATION_STATUSES.PENDING,
    paymentMethod: PAYMENT_METHODS.APPLE_PAY,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    receiptId: 'RCP-2024-004',
    notes: '',
  },
  {
    id: 'don-005',
    caseId: 'case-202',
    caseName: 'علي يحتاج دراجة للعمل',
    beneficiaryName: 'علي محمود',
    amount: 300,
    currency: 'SAR',
    type: DONATION_TYPES.SUPPLIES,
    status: DONATION_STATUSES.SUCCESS,
    paymentMethod: PAYMENT_METHODS.CARD,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    receiptId: 'RCP-2024-005',
    notes: 'تبرع لشراء دراجة',
  },
  {
    id: 'don-006',
    caseId: 'case-303',
    caseName: 'حالة حرجة - طفل مريض',
    beneficiaryName: 'صفاء محمد',
    amount: 1000,
    currency: 'SAR',
    type: DONATION_TYPES.EMERGENCY,
    status: DONATION_STATUSES.SUCCESS,
    paymentMethod: PAYMENT_METHODS.BANK,
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    receiptId: 'RCP-2024-006',
    notes: 'تبرع طواريء للحالة الحرجة',
  },
  {
    id: 'don-007',
    caseId: 'case-404',
    caseName: 'أسرة تحتاج مستلزمات شتوية',
    beneficiaryName: 'أم حمد',
    amount: 150,
    currency: 'SAR',
    type: DONATION_TYPES.SUPPLIES,
    status: DONATION_STATUSES.REFUNDED,
    paymentMethod: PAYMENT_METHODS.GOOGLE_PAY,
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    receiptId: 'RCP-2024-007',
    notes: 'تم استرجاع التبرع بسبب الحالة المسجلة',
  },
  {
    id: 'don-008',
    caseId: 'case-505',
    caseName: 'يوسف يحتاج حقيبة مدرسية',
    beneficiaryName: 'يوسف إبراهيم',
    amount: 60,
    currency: 'SAR',
    type: DONATION_TYPES.EDUCATION,
    status: DONATION_STATUSES.FAILED,
    paymentMethod: PAYMENT_METHODS.CARD,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    receiptId: 'RCP-2024-008',
    notes: 'فشل التحويل - حاول مرة أخرى',
  },
];

// Helper functions for donations data

export const loadDonations = () => {
  try {
    const stored = localStorage.getItem('user_donations');
    if (!stored) return SAMPLE_DONATIONS;

    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map(donation => ({
      ...donation,
      date: new Date(donation.date),
    }));
  } catch (e) {
    console.error('Error loading donations:', e);
    return SAMPLE_DONATIONS;
  }
};

export const saveDonations = (donations) => {
  try {
    localStorage.setItem('user_donations', JSON.stringify(donations));
  } catch (e) {
    console.error('Error saving donations:', e);
  }
};

export const getDonationStats = (donations) => {
  const successful = donations.filter(d => d.status === DONATION_STATUSES.SUCCESS);
  const totalAmount = successful.reduce((sum, d) => sum + d.amount, 0);
  const uniqueCases = new Set(successful.map(d => d.caseId)).size;
  const recentDonations = donations.slice(0, 5);

  return {
    totalAmount,
    totalCount: donations.length,
    successCount: successful.length,
    uniqueCases,
    recentDonations,
  };
};

export const formatDonationDate = (date) => {
  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('ar-SA', opts).format(date);
};

export const formatCurrency = (amount, currency = 'SAR') => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
};

export const getDonationTypeConfig = (type) => {
  return DONATION_TYPE_CONFIG[type] || DONATION_TYPE_CONFIG.cash;
};

export const getPaymentMethodConfig = (method) => {
  return PAYMENT_METHOD_CONFIG[method] || PAYMENT_METHOD_CONFIG.wallet;
};
