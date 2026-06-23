/**
 * Locafy REST API — Vercel Serverless catch-all router.
 *
 * Mọi request /api/* đều vào file này. Định tuyến theo method + path.
 *
 *  Auth:
 *    POST /api/auth/register     { username, email, phone, password, role } -> gửi OTP email
 *    POST /api/auth/send-otp     { email }                                  -> gửi lại OTP
 *    POST /api/auth/verify-otp   { email, code }                            -> tạo tài khoản, trả user
 *    POST /api/auth/login        { identifier, password }                   -> trả user
 *
 *  Resource (listings|bookings|payments|maintenance|contracts|notifications|accounts):
 *    GET    /api/<res>           -> danh sách
 *    GET    /api/<res>/:id       -> 1 bản ghi
 *    POST   /api/<res>           -> upsert
 *    PUT    /api/<res>/:id       -> cập nhật
 *    DELETE /api/<res>/:id       -> xóa
 *
 *  Chats:
 *    GET  /api/chats?chatId=&user=   -> danh sách tin nhắn ({sender,text,time})
 *    POST /api/chats                 -> { chatId, message:{text,time}, currentUser }
 *
 *  Health: GET /api/health
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getServiceClient } = require('./_lib/supabase');
const { setCors, send, readBody } = require('./_lib/http');
const RESOURCES = require('./_lib/mappers');
const { sendOtpEmail, isConfigured } = require('./_lib/mailer');

// ============ VALIDATION ============
const USERNAME_RE = /^[a-zA-Z0-9_]{4,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(03|05|07|08|09)\d{8}$/;

const OTP_TTL_MS = 5 * 60 * 1000; // 5 phút

// Base64 kiểu cũ để tương thích dữ liệu seed: btoa("locafy_" + password)
function legacyHash(password) {
    return Buffer.from('locafy_' + password, 'utf8').toString('base64');
}

async function verifyPassword(plain, stored) {
    if (!stored) return false;
    if (typeof stored === 'string' && stored.startsWith('$2')) {
        try {
            return await bcrypt.compare(plain, stored);
        } catch (_) {
            return false;
        }
    }
    // Tài khoản cũ: Base64 hoặc plaintext
    return stored === legacyHash(plain) || stored === plain;
}

function publicUser(acc) {
    return {
        name: acc.name,
        username: acc.username,
        email: acc.email,
        phone: acc.phone,
        role: acc.role || 'buyer',
    };
}

// ============ MAIN HANDLER ============
module.exports = async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return send(res, 200, { ok: true });

    // Vercel cung cấp catch-all qua req.query.path (mảng). Fallback parse từ URL.
    let parts = req.query && req.query.path;
    if (!parts) {
        const pathname = (req.url || '').split('?')[0].replace(/^\/api\/?/, '');
        parts = pathname.split('/');
    }
    if (typeof parts === 'string') parts = [parts];
    parts = (parts || []).filter(Boolean);

    try {
        if (parts[0] === 'health') {
            return send(res, 200, { ok: true, time: new Date().toISOString(), smtp: isConfigured() });
        }
        if (parts[0] === 'auth') return await handleAuth(parts[1], req, res);
        if (parts[0] === 'chats') return await handleChats(req, res);
        if (RESOURCES[parts[0]]) return await handleResource(RESOURCES[parts[0]], parts[1], req, res);
        return send(res, 404, { error: 'Endpoint không tồn tại: /' + parts.join('/') });
    } catch (err) {
        console.error('API error:', err);
        return send(res, 500, { error: err.message || 'Lỗi máy chủ' });
    }
};

// ============ AUTH ============
async function handleAuth(action, req, res) {
    if (req.method !== 'POST') return send(res, 405, { error: 'Method không hỗ trợ' });
    const sb = getServiceClient();
    const body = await readBody(req);

    if (action === 'register') return register(sb, body, res);
    if (action === 'send-otp') return sendOtp(sb, body, res);
    if (action === 'verify-otp') return verifyOtp(sb, body, res);
    if (action === 'login') return login(sb, body, res);
    return send(res, 404, { error: 'Auth action không hợp lệ' });
}

async function register(sb, body, res) {
    const username = String(body.username || '').trim().toLowerCase();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const password = String(body.password || '');
    const role = body.role === 'seller' ? 'seller' : 'buyer';
    const name = (body.name && String(body.name).trim()) || username;

    if (!username || !email || !phone || !password) {
        return send(res, 400, { error: 'Vui lòng điền đầy đủ thông tin.' });
    }
    if (!USERNAME_RE.test(username)) {
        return send(res, 400, { error: 'Tên đăng nhập tối thiểu 4 ký tự, chỉ gồm chữ, số hoặc gạch dưới.' });
    }
    if (!EMAIL_RE.test(email)) return send(res, 400, { error: 'Email không hợp lệ.' });
    if (!PHONE_RE.test(phone)) return send(res, 400, { error: 'Số điện thoại không hợp lệ (10 số, đầu 03/05/07/08/09).' });
    if (password.length < 6) return send(res, 400, { error: 'Mật khẩu phải có ít nhất 6 ký tự.' });

    // Kiểm tra trùng (truy vấn riêng để tránh injection vào .or)
    const { data: byEmail } = await sb.from('locafy_accounts').select('username').eq('email', email).limit(1);
    if (byEmail && byEmail.length) return send(res, 409, { error: 'Email đã tồn tại. Vui lòng đăng nhập.' });
    const { data: byUser } = await sb.from('locafy_accounts').select('username').eq('username', username).limit(1);
    if (byUser && byUser.length) return send(res, 409, { error: 'Tên đăng nhập đã tồn tại.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const code = String(crypto.randomInt(100000, 1000000));
    const payload = { name, username, email, phone, password: passwordHash, role };
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

    const { error } = await sb
        .from('locafy_otps')
        .upsert({ email, code, payload, expires_at: expiresAt, attempts: 0 }, { onConflict: 'email' });
    if (error) return send(res, 500, { error: 'Không tạo được mã OTP: ' + error.message });

    const mail = await safeSendOtp(email, code);
    const resp = { ok: true, email, emailSent: mail.sent };
    if (!mail.sent) resp.devOtp = code; // Chưa cấu hình SMTP -> trả OTP để test
    return send(res, 200, resp);
}

async function sendOtp(sb, body, res) {
    const email = String(body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return send(res, 400, { error: 'Email không hợp lệ.' });

    const { data: rows } = await sb.from('locafy_otps').select('*').eq('email', email).limit(1);
    if (!rows || !rows.length) {
        return send(res, 404, { error: 'Không tìm thấy yêu cầu đăng ký cho email này. Vui lòng đăng ký lại.' });
    }
    const code = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
    await sb.from('locafy_otps').update({ code, expires_at: expiresAt, attempts: 0 }).eq('email', email);

    const mail = await safeSendOtp(email, code);
    const resp = { ok: true, emailSent: mail.sent };
    if (!mail.sent) resp.devOtp = code;
    return send(res, 200, resp);
}

async function verifyOtp(sb, body, res) {
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    if (!email || code.length !== 6) return send(res, 400, { error: 'Vui lòng nhập đầy đủ mã OTP 6 chữ số.' });

    const { data: rows } = await sb.from('locafy_otps').select('*').eq('email', email).limit(1);
    const row = rows && rows[0];
    if (!row) return send(res, 400, { error: 'Mã OTP không tồn tại hoặc đã được sử dụng.' });

    if (new Date(row.expires_at).getTime() < Date.now()) {
        await sb.from('locafy_otps').delete().eq('email', email);
        return send(res, 400, { error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.' });
    }
    if ((row.attempts || 0) >= 5) {
        await sb.from('locafy_otps').delete().eq('email', email);
        return send(res, 429, { error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng đăng ký lại.' });
    }
    if (String(row.code) !== code) {
        await sb.from('locafy_otps').update({ attempts: (row.attempts || 0) + 1 }).eq('email', email);
        return send(res, 400, { error: 'Mã OTP không đúng. Vui lòng thử lại.' });
    }

    const acc = row.payload || {};
    const { error: insErr } = await sb.from('locafy_accounts').insert({
        username: acc.username,
        email: acc.email,
        password: acc.password,
        role: acc.role || 'buyer',
        name: acc.name,
        phone: acc.phone,
        verified: false,
        created_at: new Date().toISOString(),
    });
    if (insErr) {
        // Trùng do bấm xác nhận 2 lần — vẫn coi là thành công nếu tài khoản đã tồn tại
        if (!String(insErr.message || '').toLowerCase().includes('duplicate')) {
            return send(res, 500, { error: 'Không tạo được tài khoản: ' + insErr.message });
        }
    }
    await sb.from('locafy_otps').delete().eq('email', email);
    return send(res, 200, { ok: true, user: publicUser(acc) });
}

async function login(sb, body, res) {
    const identifier = String(body.identifier || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!identifier || !password) return send(res, 400, { error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });

    const { data: byEmail } = await sb.from('locafy_accounts').select('*').eq('email', identifier).limit(1);
    let user = byEmail && byEmail[0];
    if (!user) {
        const { data: byUser } = await sb.from('locafy_accounts').select('*').eq('username', identifier).limit(1);
        user = byUser && byUser[0];
    }
    if (!user) return send(res, 401, { error: 'Email, tên đăng nhập hoặc mật khẩu không đúng.' });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return send(res, 401, { error: 'Email, tên đăng nhập hoặc mật khẩu không đúng.' });

    return send(res, 200, { ok: true, user: publicUser(user) });
}

async function safeSendOtp(email, code) {
    try {
        return await sendOtpEmail(email, code);
    } catch (e) {
        console.error('Gửi OTP email thất bại:', e.message);
        return { sent: false, reason: e.message };
    }
}

// ============ RESOURCES (CRUD) ============
async function handleResource(resource, id, req, res) {
    const sb = getServiceClient();
    const { table, pk, toApi, toDb } = resource;

    if (req.method === 'GET') {
        if (id) {
            const { data, error } = await sb.from(table).select('*').eq(pk, id).limit(1);
            if (error) return send(res, 500, { error: error.message });
            if (!data || !data.length) return send(res, 404, { error: 'Không tìm thấy bản ghi.' });
            return send(res, 200, toApi(data[0]));
        }
        const { data, error } = await sb.from(table).select('*');
        if (error) return send(res, 500, { error: error.message });
        return send(res, 200, (data || []).map(toApi));
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        const body = await readBody(req);
        const row = toDb(body);
        if (id) row[pk] = id;
        if (!row[pk]) return send(res, 400, { error: 'Thiếu khóa chính (' + pk + ').' });

        // Accounts: nếu không gửi password, lấy password cũ từ DB để tránh NOT NULL
        if (table === 'locafy_accounts') {
            if (!row.password) {
                const { data: existing } = await sb.from(table).select('password').eq(pk, row[pk]).limit(1);
                if (existing && existing[0]) {
                    row.password = existing[0].password;
                }
            } else if (!row.password.startsWith('$2')) {
                row.password = await bcrypt.hash(row.password, 10);
            }
        }

        const { data, error } = await sb.from(table).upsert(row, { onConflict: pk }).select();
        if (error) return send(res, 500, { error: error.message });
        return send(res, 200, data && data[0] ? toApi(data[0]) : { ok: true });
    }

    if (req.method === 'DELETE') {
        if (!id) return send(res, 400, { error: 'Thiếu id để xóa.' });
        const { error } = await sb.from(table).delete().eq(pk, id);
        if (error) return send(res, 500, { error: error.message });
        return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: 'Method không hỗ trợ' });
}

// ============ CHATS ============
async function handleChats(req, res) {
    const sb = getServiceClient();

    if (req.method === 'GET') {
        const url = new URL(req.url, 'http://localhost');
        const chatId = url.searchParams.get('chatId');
        const currentUser = url.searchParams.get('user');
        if (!chatId) return send(res, 400, { error: 'Thiếu chatId.' });

        const { data, error } = await sb
            .from('locafy_chats')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        if (error) return send(res, 500, { error: error.message });

        return send(
            res,
            200,
            (data || []).map((m) => ({
                sender: m.sender_username === currentUser ? 'sender' : 'receiver',
                text: m.text,
                time: m.time,
            }))
        );
    }

    if (req.method === 'POST') {
        const body = await readBody(req);
        const { chatId, message, currentUser } = body;
        if (!chatId || !message || !currentUser) {
            return send(res, 400, { error: 'Thiếu chatId, message hoặc currentUser.' });
        }
        const { error } = await sb.from('locafy_chats').insert({
            chat_id: chatId,
            sender_username: currentUser,
            text: message.text,
            time: message.time,
        });
        if (error) return send(res, 500, { error: error.message });
        return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: 'Method không hỗ trợ' });
}
