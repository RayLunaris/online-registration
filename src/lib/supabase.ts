import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project')
  );
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
  file: File
) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase credentials not configured. Returning mock file URL.');
    return { data: { path: filePath, publicUrl: URL.createObjectURL(file) }, error: null };
  }

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: filePath.endsWith('.pdf') ? 'application/pdf' : file.type
  });

  if (error) {
    return { data: null, error };
  }

  const publicUrl = getStoragePublicUrl(bucket, data.path);
  return { data: { ...data, publicUrl }, error: null };
};
