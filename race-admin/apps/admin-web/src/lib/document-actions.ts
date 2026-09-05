import { apiClient, getAccessToken } from '@race/api';

function resolveDocumentPath(url: string): string {
  if (url.startsWith('/admin')) return url;
  if (url.startsWith('/')) return `/admin${url}`;
  return `/admin/${url}`;
}

async function parseBlobError(blob: Blob): Promise<string> {
  try {
    const text = await blob.text();
    const payload = JSON.parse(text) as { message?: string };
    return payload.message ?? 'Failed to load document';
  } catch {
    return 'Failed to load document';
  }
}

export async function fetchDocumentBlob(url: string): Promise<Blob> {
  if (!url) throw new Error('Document URL is missing');
  if (!getAccessToken()) throw new Error('Please sign in again to open documents');

  const response = await apiClient.get(resolveDocumentPath(url), { responseType: 'blob' });
  const blob = response.data as Blob;

  if (blob.type?.includes('json')) {
    throw new Error(await parseBlobError(blob));
  }

  const contentType = response.headers['content-type'] as string | undefined;
  if (contentType?.includes('json')) {
    throw new Error(await parseBlobError(blob));
  }

  return new Blob([blob], { type: 'application/pdf' });
}

export async function openDocument(url: string, _filename: string, previewWindow?: Window | null) {
  const blob = await fetchDocumentBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const target = previewWindow ?? window.open('', '_blank');
  if (!target) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Pop-up blocked. Allow pop-ups to open the document.');
  }
  target.location.href = objectUrl;
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function downloadDocument(url: string, filename: string) {
  const blob = await fetchDocumentBlob(url);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
