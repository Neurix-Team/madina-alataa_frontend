import { axiosClient } from './axiosClient';

// const CHILDREN_API_URL = '/api/Child';

const CHILDREN_API_URL = '/api/child';
// Helper to get user ID from localStorage
const getUserId = () => {
  try {
    const userData = localStorage.getItem('user_data') || localStorage.getItem('madeena_login_user_response');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.userId || parsed.id || parsed.user?.id || parsed.user?.userId || null;
    }
  } catch (e) {
    console.warn('Failed to parse user data from localStorage', e);
  }
  return null;
};

export const childrenService = {
  /**
   * Get current user's children
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  getMyChildren: async () => {
    try {
      console.log('🔍 Fetching my children from API...', {
        url: `${CHILDREN_API_URL}/my-children`
      });

      const response = await axiosClient.get(`${CHILDREN_API_URL}/my-children`);

      console.log('✅ Get My Children API Response:', response.data);

      const raw = response.data;
      const children =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.data?.items) ? raw.data.items :
        Array.isArray(raw?.items) ? raw.items :
        Array.isArray(raw?.value) ? raw.value :
        Array.isArray(raw?.value?.items) ? raw.value.items :
        Array.isArray(raw?.result) ? raw.result :
        Array.isArray(raw?.result?.items) ? raw.result.items :
        [];

      return children;
    } catch (error) {
      console.error('❌ Error fetching my children:', error);

      if (error.response) {
        console.error('❌ Get My Children API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  },

  /**
   * Create a new child
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
//   createChild: async (childData) => {
//     try {
//       console.log('📤 Creating child with data:', JSON.stringify(childData, null, 2));

// //       const userId = getUserId();

// //       // const payload = {
// //       //   fullName: String(childData.fullName || '').trim(),
// //       //   name: String(childData.fullName || '').trim(),
// //       //   dailyLimit: Number(childData.dailyLimit) || 0.01,
// //       //   allowDonations: Boolean(childData.allowDonations),
// //       //   status: 'Pending',
// //       //   userId: userId,
// //       //   parentId: userId,
// //       // };
// //       const payload = {
// //   fullName: String(childData.fullName || '').trim(),
// //   dailyLimit: Number(childData.dailyLimit) || 0.01,
// //   allowDonations: Boolean(childData.allowDonations),
// // };

// //       console.log('📤 Sanitized child payload:', JSON.stringify(payload, null, 2));
// //       console.log('👤 Current User ID:', userId);

// //       const response = await axiosClient.post(CHILDREN_API_URL, payload);

// const payload = {
//   fullName: String(childData.fullName || '').trim(),
//   dailyLimit: Number(childData.dailyLimit) || 0.01,
//   allowDonations: Boolean(childData.allowDonations),
// };

// console.log('📤 Sanitized child payload:', JSON.stringify(payload, null, 2));

// const response = await axiosClient.post(CHILDREN_API_URL, payload);
//       console.log('✅ Create Child API Success:', response.data);

//       return response.data;
//     } catch (error) {
//       console.error('❌ Error creating child:', error);

//       if (error.response) {
//         console.error('❌ Create Child API Error:', {
//           status: error.response.status,
//           statusText: error.response.statusText,
//           data: JSON.stringify(error.response.data, null, 2),
//           headers: error.response.headers
//         });
//       }

//       throw error;
//     }
//   },
// createChild: async (childData) => {
//   try {
//     console.log('📤 Creating child with data:', JSON.stringify(childData, null, 2));

//     const fullName = String(childData.fullName || '').trim();
//     const safeName = fullName
//       .replace(/\s+/g, '_')
//       .replace(/[^\u0600-\u06FFa-zA-Z0-9_]/g, '')
//       .slice(0, 20);

//     const uniquePart = `${Date.now()}`.slice(-8);

//    const payload = {
//   fullName,
//   dailyLimit: Number(childData.dailyLimit) || 0.01,
//   allowDonations: Boolean(childData.allowDonations),

//   email: `child_${safeName || 'user'}_${uniquePart}@example.com`,
//   password: `Child@${uniquePart}Aa`
// };
//     console.log('📤 Final child payload:', JSON.stringify(payload, null, 2));

//     const response = await axiosClient.post('/api/child', payload, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     console.log('✅ Create Child API Success:', response.data);

//     return response.data;
//   } catch (error) {
//     console.error('❌ Error creating child:', error);

//     if (error.response) {
//       const responseData = error.response.data;

//       console.error('❌ Create Child API Error:', {
//         status: error.response.status,
//         statusText: error.response.statusText,
//         data: responseData,
//         errors: responseData?.errors,
//         headers: error.response.headers
//       });

//       const apiErrors = responseData?.errors
//         ? Object.values(responseData.errors).flat().join('\n')
//         : responseData?.title || responseData?.message || 'فشل في إضافة الطفل.';

//       throw new Error(apiErrors);
//     }

//     throw error;
//   }
// },
createChild: async (childData) => {
  try {
    console.log('📤 Creating child with data:', JSON.stringify(childData, null, 2));

    // Build payload matching exact curl structure
    const payload = {
      fullName: String(childData.fullName || '').trim(),
      email: String(childData.email || '').trim(),
      birthDay: String(childData.birthDay || ''),
      password: String(childData.password || ''),
      dailyLimit: Number(childData.dailyLimit) || 0.01,
      allowDonations: Boolean(childData.allowDonations),
    };

    console.log('📤 Final child payload (matching curl):', JSON.stringify(payload, null, 2));

    const response = await axiosClient.post(CHILDREN_API_URL, payload);

    console.log('✅ Create Child API Success:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Error creating child:', error);

    if (error.response) {
      const responseData = error.response.data;

      console.error('❌ RAW_API_ERROR:', JSON.stringify(responseData, null, 2));

      console.error('❌ Create Child API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: responseData,
        headers: error.response.headers
      });

      throw new Error(
        responseData?.title ||
        responseData?.message ||
        responseData?.detail ||
        JSON.stringify(responseData)
      );
    }

    throw error;
  }
},
  /**
   * Get pending children (Admin only)
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  getPendingChildren: async () => {
    try {
      console.log('🔍 Fetching pending children from API...', {
        url: `${CHILDREN_API_URL}/pending`
      });

      const response = await axiosClient.get(`${CHILDREN_API_URL}/pending`);

      console.log('✅ Get Pending Children API Response:', response.data);

      const raw = response.data;
      const children =
        Array.isArray(raw) ? raw :
        Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.data?.items) ? raw.data.items :
        Array.isArray(raw?.items) ? raw.items :
        Array.isArray(raw?.value) ? raw.value :
        Array.isArray(raw?.value?.items) ? raw.value.items :
        Array.isArray(raw?.result) ? raw.result :
        Array.isArray(raw?.result?.items) ? raw.result.items :
        [];

      return children;
    } catch (error) {
      console.error('❌ Error fetching pending children:', error);

      if (error.response) {
        console.error('❌ Get Pending Children API Error:', {
          status: error.response.status,
          data: error.response.data
        });
      }

      throw error;
    }
  },

  /**
   * Approve a child (Admin only)
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  approveChild: async (childId) => {
    try {
      console.log('✅ Approving child...', {
        url: `${CHILDREN_API_URL}/approve`,
        childId
      });

      const payload = {
        childId: String(childId)
      };

      const response = await axiosClient.post(`${CHILDREN_API_URL}/approve`, payload);

      console.log('✅ Approve Child API Success:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error approving child:', error);

      if (error.response) {
        console.error('❌ Approve Child API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      throw error;
    }
  },

  /**
   * Reject a child (Admin only)
   * Sends auth token automatically via axios interceptor
   * Logs response to console
   */
  rejectChild: async (childId, rejectionReason) => {
    try {
      console.log('❌ Rejecting child...', {
        url: `${CHILDREN_API_URL}/reject`,
        childId,
        rejectionReason
      });

      const payload = {
        childId: String(childId),
        rejectionReason: String(rejectionReason || '').trim()
      };

      const response = await axiosClient.post(`${CHILDREN_API_URL}/reject`, payload);

      console.log('✅ Reject Child API Success:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error rejecting child:', error);

      if (error.response) {
        console.error('❌ Reject Child API Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      throw error;
    }
  }
};

export default childrenService;
