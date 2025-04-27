export function getFileUrl(record, fileName) {
  const baseUrl = 'http://localhost:8090/api/files/';
  const collectionId = record?.collectionId;
  const recordId = record?.id;
  if (!collectionId || !recordId || !fileName || typeof fileName !== 'string') {
    console.error(
      'Missing essential data to build file URL: record object, collectionId, recordId, or imageName.'
    );
    return null;
  }
  const fullUrl = `${baseUrl}${collectionId}/${recordId}/${fileName}`;
  return fullUrl;
}
export function normalizeFileUrls(record) {
  const hasRequiredIds = record.collectionId && record.id;
  if (!hasRequiredIds) {
    console.warn(
      `Record is missing collectionId or id. Cannot normalize image URLs for record:`,
      record
    );
    return null;
  }
  record.heroImage = getFileUrl(record, record.heroImage);
  record.images = record.images.map((fileName) => getFileUrl(record, fileName));
  return record;
}
