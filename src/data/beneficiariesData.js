// src/data/beneficiariesData.js
// Domain Entity: Beneficiary + Partner

/**
 * @typedef {Object} Beneficiary
 * @property {string} id
 * @property {string} name
 * @property {'Beneficiary'} type
 * @property {'elderly'|'orphans'|'education'|'community'|'environment'|'health'|'rural'} category
 * @property {string} zoneId  — linked zone
 * @property {string} emoji
 * @property {string} description
 * @property {number} needsCount
 * @property {number} helpedCount
 * @property {'low'|'medium'|'high'|'critical'} urgency
 * @property {string} address
 */

/**
 * @typedef {Object} Partner
 * @property {string} id
 * @property {string} name
 * @property {'Partner'} type
 * @property {'ngo'|'corporate'|'governmental'|'environmental'} category
 * @property {string} emoji
 * @property {string} description
 * @property {string[]} supportedBeneficiaries
 * @property {string} joinedDate
 * @property {string} contactEmail
 */

/** @type {Beneficiary[]} */
export const beneficiariesData = [
  {
    id: 'ben1',
    name: 'دار الأجداد',
    type: 'Beneficiary',
    category: 'elderly',
    zoneId: 'z1',
    emoji: '❤️',
    description: 'دار رعاية المسنين — يضم 45 مسناً يحتاجون للرعاية والاهتمام اليومي',
    needsCount: 12,
    helpedCount: 0,
    urgency: 'high',
    address: 'شارع النيل، القاهرة',
  },
  {
    id: 'ben2',
    name: 'دار البراعم',
    type: 'Beneficiary',
    category: 'orphans',
    zoneId: 'z2',
    emoji: '👥',
    description: 'دار رعاية الأيتام — يضم 30 طفلاً يحتاجون للرعاية والتعليم والحنان',
    needsCount: 8,
    helpedCount: 0,
    urgency: 'high',
    address: 'شارع الأزهر، القاهرة',
  },
  {
    id: 'ben3',
    name: 'مدرسة النور',
    type: 'Beneficiary',
    category: 'education',
    zoneId: 'z3',
    emoji: '🎓',
    description: 'مدرسة للأطفال المحتاجين — تحتاج لمتطوعين للتدريس وتوفير الأدوات',
    needsCount: 5,
    helpedCount: 0,
    urgency: 'medium',
    address: 'شارع التحرير، القاهرة',
  },
  {
    id: 'ben4',
    name: 'حي الأصدقاء',
    type: 'Beneficiary',
    category: 'community',
    zoneId: 'z4',
    emoji: '🏠',
    description: 'مجتمع محلي يضم أسراً محتاجة تحتاج لدعم ومساعدة متنوعة',
    needsCount: 20,
    helpedCount: 0,
    urgency: 'medium',
    address: 'حي الزيتون، القاهرة',
  },
  {
    id: 'ben5',
    name: 'المركز المجتمعي',
    type: 'Beneficiary',
    category: 'community',
    zoneId: 'z5',
    emoji: '🧺',
    description: 'مركز خدمات مجتمعية يوزع السلال الغذائية على الأسر المحتاجة',
    needsCount: 15,
    helpedCount: 0,
    urgency: 'low',
    address: 'شارع الجمهورية، القاهرة',
  },
  {
    id: 'ben6',
    name: 'حديقة الأمل',
    type: 'Beneficiary',
    category: 'environment',
    zoneId: 'z6',
    emoji: '🌲',
    description: 'حديقة عامة تخدم آلاف الزوار وتحتاج للصيانة والتنظيف المستمر',
    needsCount: 6,
    helpedCount: 0,
    urgency: 'low',
    address: 'حديقة الأندلس، القاهرة',
  },
  {
    id: 'ben7',
    name: 'مستشفى الشفاء',
    type: 'Beneficiary',
    category: 'health',
    zoneId: 'z7',
    emoji: '🩺',
    description: 'مستشفى حكومي يحتاج لمتطوعين لمساعدة المرضى وإسعادهم',
    needsCount: 10,
    helpedCount: 0,
    urgency: 'high',
    address: 'شارع القصر العيني، القاهرة',
  },
  {
    id: 'ben8',
    name: 'قرية السلام',
    type: 'Beneficiary',
    category: 'rural',
    zoneId: 'z8',
    emoji: '📍',
    description: 'قرية نائية تعاني من شُح المياه وتحتاج لمشاريع تنموية عاجلة',
    needsCount: 25,
    helpedCount: 0,
    urgency: 'critical',
    address: 'قرية السلام، الجيزة',
  },
];

/** @type {Partner[]} */
export const partnersData = [
  {
    id: 'par1',
    name: 'مركز الأمل للتطوع',
    type: 'Partner',
    category: 'ngo',
    emoji: '🤝',
    description: 'منظمة غير حكومية رائدة في دعم أعمال التطوع وتنسيق الجهود الخيرية',
    supportedBeneficiaries: ['ben1', 'ben2', 'ben3'],
    joinedDate: '2024-01-01',
    contactEmail: 'info@amal-center.org',
  },
  {
    id: 'par2',
    name: 'شركة الخير للمسؤولية الاجتماعية',
    type: 'Partner',
    category: 'corporate',
    emoji: '🏢',
    description: 'شركة رائدة تدعم مبادرات المسؤولية الاجتماعية وتموّل المشاريع الخيرية',
    supportedBeneficiaries: ['ben4', 'ben5'],
    joinedDate: '2024-03-15',
    contactEmail: 'csr@alkhair.com',
  },
  {
    id: 'par3',
    name: 'جمعية البيئة الخضراء',
    type: 'Partner',
    category: 'environmental',
    emoji: '🌿',
    description: 'جمعية متخصصة في حماية البيئة والمساحات الخضراء وتوعية المجتمع',
    supportedBeneficiaries: ['ben6'],
    joinedDate: '2024-02-20',
    contactEmail: 'green@environment.org',
  },
  {
    id: 'par4',
    name: 'وزارة الصحة — برنامج التطوع',
    type: 'Partner',
    category: 'governmental',
    emoji: '🏥',
    description: 'برنامج حكومي لتنظيم التطوع في المستشفيات والمرافق الصحية',
    supportedBeneficiaries: ['ben7'],
    joinedDate: '2024-04-01',
    contactEmail: 'volunteer@health.gov.eg',
  },
];

export default beneficiariesData;
