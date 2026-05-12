import { axiosClient } from './axiosClient';

const CERTIFICATES_ENDPOINT = '/api/Certificate';

const normalizeCertificateItem = (item) => {
  if (!item || typeof item !== 'object') return item;

  return {
    ...item,
    id:
      item.id ??
      item.Id ??
      item.certificateId ??
      item.CertificateId ??
      item.guid ??
      item.Guid ??
      '',
    title: item.title ?? item.Title ?? item.name ?? item.Name ?? 'Certificate',
    description: item.description ?? item.Description ?? '',
    issuedAt: item.issuedAt ?? item.IssuedAt ?? item.createdAt ?? item.CreatedAt ?? '',
    fileUrl: item.fileUrl ?? item.FileUrl ?? item.url ?? item.Url ?? '',
  };
};

const normalizeCertificatesResponse = (payload) => {
  const itemsSource =
    payload?.items ??
    payload?.Items ??
    payload?.data?.items ??
    payload?.data?.Items ??
    payload?.value?.items ??
    payload?.value?.Items ??
    payload?.result?.items ??
    payload?.result?.Items ??
    [];

  const items = Array.isArray(itemsSource) ? itemsSource.map(normalizeCertificateItem) : [];

  return {
    raw: payload,
    items,
  };
};

export const certificatesService = {
  async getMyCertificates({ pageNumber = 1, pageSize = 1 } = {}) {
    const response = await axiosClient.get(
      `${CERTIFICATES_ENDPOINT}/my?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
    return normalizeCertificatesResponse(response.data);
  },

  async getUserCertificates(userId, { pageNumber = 1, pageSize = 1 } = {}) {
    const response = await axiosClient.get(
      `${CERTIFICATES_ENDPOINT}/user/${userId}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
    return normalizeCertificatesResponse(response.data);
  },

  async getCertificates({ pageNumber = 1, pageSize = 1 } = {}) {
    const response = await axiosClient.get(
      `${CERTIFICATES_ENDPOINT}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
    return normalizeCertificatesResponse(response.data);
  },
};

export default certificatesService;
