import { requireSupabase } from '../lib/supabase';

const BUCKET = 'report-evidence';

function formatDate(value) {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function toUiReport(report) {
  return {
    id: report.id,
    type: report.category,
    title: report.title,
    date: report.occurred_date || formatDate(report.created_at),
    time: report.occurred_time || formatTime(report.created_at),
    place: report.location,
    status: report.status,
    description: report.description,
    evidenceUrls: report.evidence_urls || [],
    updates: report.updates_count || 0,
    anonymous: report.is_anonymous,
    severity: report.severity,
    createdAt: report.created_at,
  };
}

export async function fetchReports() {
  const { data, error } = await requireSupabase()
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toUiReport);
}

async function uploadEvidence(userId, file) {
  if (!file) return [];
  if (file.size > 10 * 1024 * 1024) throw new Error('حجم مدرک باید کمتر از ۱۰ مگابایت باشد.');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await requireSupabase().storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
  if (error) throw error;
  return [path];
}

export async function createReport(input, user) {
  const evidenceUrls = await uploadEvidence(user.id, input.evidenceFile);
  const selectedTitle = input.title || 'سایر موارد';
  const payload = {
    owner_id: user.id,
    user_id: input.anonymous ? null : user.id,
    category: input.type,
    title: selectedTitle,
    description: input.description,
    location: input.place,
    evidence_urls: evidenceUrls,
    status: 'reviewing',
    severity: input.severity,
    is_anonymous: input.anonymous,
    occurred_date: input.date || null,
    occurred_time: input.time || null,
  };

  const { data, error } = await requireSupabase()
    .from('reports')
    .insert(payload)
    .select()
    .single();
  if (error) {
    if (evidenceUrls.length) await requireSupabase().storage.from(BUCKET).remove(evidenceUrls);
    throw error;
  }
  return toUiReport(data);
}

export async function updateReportStatus(id, status) {
  const { data, error } = await requireSupabase()
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return toUiReport(data);
}
