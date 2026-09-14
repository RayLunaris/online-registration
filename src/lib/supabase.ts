import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const isPlaceholder = (val?: string): boolean => {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return (
    lower.includes('placeholder') ||
    lower.includes('your-project') ||
    lower.includes('your-anon-key') ||
    lower === ''
  );
};

export const isSupabaseConfigured = (): boolean => {
  if (!envUrl || !envAnonKey || isPlaceholder(envUrl) || isPlaceholder(envAnonKey)) {
    return false;
  }
  try {
    const parsed = new URL(envUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * Supabase client instance.
 * When properly configured, connects to production/staging Supabase project.
 * In demo/unconfigured mode, an inert localhost dummy client is created with
 * session persistence and auto-refresh disabled, ensuring zero network traffic
 * or telemetry leaks to external third-party placeholder domains.
 */
export const supabase: SupabaseClient<Database> = isSupabaseConfigured()
  ? createClient<Database>(envUrl!, envAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient<Database>('http://127.0.0.1:54321', 'inert-demo-mode-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

if (!isSupabaseConfigured() && import.meta.env.DEV) {
  console.info('SPMB: Berjalan dalam Demo Mode (kredensial Supabase tidak dikonfigurasi).');
}


/**
 * Storage helpers
 */
export const getStoragePublicUrl = (bucket: string, path: string) => {
  if (!isSupabaseConfigured()) {
    return path;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadStorageFile = async (
  bucket: 'student-documents' | 'student-photos' | 'school-assets' | 'announcements',
  filePath: string,
  file: File,
  onProgress?: (percent: number) => void
) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase credentials not configured. Returning mock file URL.');
    if (onProgress) {
      const steps = [15, 35, 58, 79, 92, 100];
      for (const pct of steps) {
        onProgress(pct);
        await new Promise((r) => setTimeout(r, 120));
      }
    }
    return { data: { path: filePath, publicUrl: URL.createObjectURL(file) }, error: null };
  }

  // If onProgress is requested, use XMLHttpRequest for native upload progress reporting
  if (onProgress) {
    try {
      const url = `${envUrl}/storage/v1/object/${bucket}/${filePath}`;
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token || envAnonKey;

      const res = await new Promise<{ data: any; error: any }>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('apikey', envAnonKey!);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('x-upsert', 'true');
        xhr.setRequestHeader(
          'Content-Type',
          filePath.endsWith('.pdf') ? 'application/pdf' : file.type || 'application/octet-stream'
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
            onProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onProgress(100);
            try {
              const json = JSON.parse(xhr.responseText);
              resolve({ data: json, error: null });
            } catch {
              resolve({ data: { Key: `${bucket}/${filePath}` }, error: null });
            }
          } else {
            resolve({ data: null, error: new Error(`Upload failed with status ${xhr.status}`) });
          }
        };

        xhr.onerror = () => {
          resolve({ data: null, error: new Error('Network error during upload') });
        };

        xhr.send(file);
      });

      if (!res.error && res.data) {
        const publicUrl = getStoragePublicUrl(bucket, filePath);
        return { data: { path: filePath, publicUrl }, error: null };
      }
    } catch {
      // Fall through to standard SDK upload if XHR fails
    }
  }

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: filePath.endsWith('.pdf') ? 'application/pdf' : file.type
  });

  if (error) {
    return { data: null, error };
  }

  if (onProgress) onProgress(100);
  const publicUrl = getStoragePublicUrl(bucket, data.path);
  return { data: { ...data, publicUrl }, error: null };
};
