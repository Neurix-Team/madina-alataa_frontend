// src/data/ordersData.js
// Domain Entity: ServiceRequest (initial seed data from Beneficiaries)

/**
 * @typedef {'VolunteerOrder'|'DonationOrder'|'ServiceRequest'} OrderType
 * @typedef {'open'|'in_progress'|'completed'|'cancelled'} OrderStatus
 * @typedef {'low'|'medium'|'high'|'critical'} Urgency
 */

/**
 * Initial ServiceRequests created by Beneficiaries.
 * VolunteerOrders and DonationOrders are created at runtime by Actors.
 * @type {Array<{id:string, type:'ServiceRequest', beneficiaryId:string, title:string,
 *   description:string, urgency:Urgency, requiredVolunteers:number,
 *   currentVolunteers:number, status:OrderStatus, questId:string|null, createdAt:string}>}
 */
const serviceRequestsData = [
  {
    id: 'sr1',
    type: 'ServiceRequest',
    beneficiaryId: 'ben1',
    title: 'زيارة المسنين وقراءة لهم',
    description: 'نحتاج 3 متطوعين لزيارة المسنين يومياً وقراءة الرسائل والكتب لهم',
    urgency: 'high',
    requiredVolunteers: 3,
    currentVolunteers: 0,
    status: 'open',
    questId: 'q1',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'sr2',
    type: 'ServiceRequest',
    beneficiaryId: 'ben2',
    title: 'تجديد ألعاب الأطفال',
    description: 'نحتاج متطوعين لإصلاح وتجديد ألعاب الأطفال في الدار وتنظيم حفلة',
    urgency: 'medium',
    requiredVolunteers: 2,
    currentVolunteers: 0,
    status: 'open',
    questId: 'q4',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
  },
  {
    id: 'sr3',
    type: 'ServiceRequest',
    beneficiaryId: 'ben3',
    title: 'توفير أدوات مدرسية للطلاب',
    description: 'نحتاج لتوفير حقائب وأدوات مدرسية للأطفال المحتاجين في المدرسة',
    urgency: 'medium',
    requiredVolunteers: 2,
    currentVolunteers: 0,
    status: 'open',
    questId: 'q5',
    createdAt: new Date(Date.now() - 259_200_000).toISOString(),
  },
  {
    id: 'sr4',
    type: 'ServiceRequest',
    beneficiaryId: 'ben7',
    title: 'إسعاد مرضى الأطفال في المستشفى',
    description: 'نحتاج متطوعين لزيارة الأطفال المرضى وإسعادهم بالألعاب والقصص',
    urgency: 'high',
    requiredVolunteers: 4,
    currentVolunteers: 1,
    status: 'open',
    questId: 'q11',
    createdAt: new Date(Date.now() - 43_200_000).toISOString(),
  },
  {
    id: 'sr5',
    type: 'ServiceRequest',
    beneficiaryId: 'ben8',
    title: 'مشروع المياه النظيفة العاجل',
    description: 'مشروع عاجل جداً لتوفير المياه النظيفة لسكان القرية — الوضع حرج',
    urgency: 'critical',
    requiredVolunteers: 10,
    currentVolunteers: 2,
    status: 'open',
    questId: 'q13',
    createdAt: new Date(Date.now() - 21_600_000).toISOString(),
  },
  {
    id: 'sr6',
    type: 'ServiceRequest',
    beneficiaryId: 'ben5',
    title: 'تعبئة السلال الغذائية الشهرية',
    description: 'نحتاج متطوعين لتعبئة وتوزيع 50 سلة غذائية على الأسر المحتاجة',
    urgency: 'low',
    requiredVolunteers: 5,
    currentVolunteers: 0,
    status: 'open',
    questId: 'q7',
    createdAt: new Date(Date.now() - 345_600_000).toISOString(),
  },
];

export default serviceRequestsData;
