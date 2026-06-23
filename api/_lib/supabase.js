/**
 * Server-side Supabase client (Service Role).
 * CHỈ dùng phía server (Vercel Serverless) — sử dụng SUPABASE_SECRET_KEY để bỏ qua RLS.
 * Tuyệt đối KHÔNG expose key này ra client (generate-env.js đã loại trừ).
 */
const { createClient } = require('@supabase/supabase-js');

let _client = null;

function getServiceClient() {
    if (_client) return _client;

    const url = process.env.SUPABASE_URL;
    const key =
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY;

    if (!url || !key) {
        throw new Error(
            'Thiếu cấu hình Supabase phía server. Cần SUPABASE_URL và SUPABASE_SECRET_KEY trong biến môi trường.'
        );
    }

    _client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return _client;
}

module.exports = { getServiceClient };
