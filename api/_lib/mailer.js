/**
 * Gửi email OTP qua Resend API hoặc SMTP (nodemailer).
 * Cấu hình bằng biến môi trường (server-side only, bảo mật):
 *   - Resend: RESEND_API_KEY, RESEND_FROM
 *   - SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * Ưu tiên sử dụng Resend API nếu được cấu hình. Nếu không, tự động fallback sang SMTP.
 * Nếu cả hai đều chưa được cấu hình, mailer trả về { sent:false } để chạy chế độ dev (OTP hiển thị trong response).
 */
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// 1. SMTP Transport Helper
function getTransport() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;

    const port = Number(process.env.SMTP_PORT || 587);
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // 465 = SSL, 587 = STARTTLS
        auth: { user, pass },
    });
}

// 2. Resend Client Helper
let _resendClient = null;
function getResendClient() {
    if (_resendClient) return _resendClient;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_xxxxxxxxx' || apiKey.trim() === '') return null;
    _resendClient = new Resend(apiKey);
    return _resendClient;
}

function isConfigured() {
    return !!getResendClient() || !!getTransport();
}

async function sendOtpEmail(to, code) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã xác thực tài khoản Locafy</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Be Vietnam Pro',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;padding:48px 16px">
        <tr>
            <td align="center">
                <!-- Card Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 10px 30px -5px rgba(15,23,42,0.03),0 8px 10px -6px rgba(15,23,42,0.01);overflow:hidden">
                    
                    <!-- Decorative Top Accent Bar -->
                    <tr>
                        <td height="6" style="background:linear-gradient(90deg,#2563eb 0%,#1d4ed8 100%)"></td>
                    </tr>
                    
                    <!-- Main Body Padding -->
                    <tr>
                        <td style="padding:40px">
                            
                            <!-- Header Logo & Brand Name -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
                                            <tr>
                                                <td style="background-color:#eff6ff;padding:12px;border-radius:16px;display:inline-block">
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block">
                                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                    </svg>
                                                </td>
                                                <td style="padding-left:12px">
                                                    <span style="font-size:22px;font-weight:900;color:#1e3a8a;letter-spacing:-0.5px">Locafy</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Title -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom:20px">
                                        <h1 style="margin:0;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;text-align:center">Xác thực địa chỉ Email</h1>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Text -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom:24px;text-align:center">
                                        <p style="margin:0;font-size:14px;color:#475569;line-height:1.6">Chào bạn,</p>
                                        <p style="margin:8px 0 0 0;font-size:14px;color:#475569;line-height:1.6">Cảm ơn bạn đã lựa chọn tin cậy Locafy. Dưới đây là mã xác thực tài khoản (OTP) đăng ký của bạn:</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- OTP Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom:24px">
                                        <table border="0" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#eff6ff 0%,#ecfdf5 100%);border:1px solid #cbd5e1;border-radius:18px">
                                            <tr>
                                                <td style="padding:20px 36px;text-align:center">
                                                    <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#1e3a8a;line-height:1;margin:0;text-indent:10px">${code}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning Details -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border-radius:16px;border:1px solid #f1f5f9">
                                <tr>
                                    <td style="padding:16px;text-align:center">
                                        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5">Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>.</p>
                                        <p style="margin:4px 0 0 0;font-size:12px;color:#ef4444;line-height:1.5;font-weight:600">Vì lý do bảo mật, tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding:20px 0;border-bottom:1px solid #f1f5f9"></td>
                                </tr>
                            </table>

                            <!-- Help Contact / Footer Note -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding-top:24px">
                                <tr>
                                    <td style="text-align:center">
                                        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.</p>
                                        <p style="margin:8px 0 0 0;font-size:13px;color:#64748b;line-height:1.6;font-weight:600">Trân trọng,<br><span style="color:#2563eb">Đội ngũ phát triển Locafy</span></p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    // 1. Thử gửi qua Resend API trước (nếu được cấu hình trong env hệ thống)
    const resend = getResendClient();
    if (resend) {
        try {
            const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
            const { data, error } = await resend.emails.send({
                from: `Locafy <${from}>`,
                to,
                subject: `Mã xác thực Locafy: ${code}`,
                html,
            });

            if (error) {
                console.error('Lỗi Resend API:', error);
                return { sent: false, reason: error.message };
            }

            return { sent: true, provider: 'resend' };
        } catch (e) {
            console.error('Ngoại lệ khi gửi qua Resend:', e);
            // Tiếp tục chạy để thử gửi qua SMTP fallback
        }
    }

    // 2. Tự động fallback sang SMTP (Nodemailer) nếu cấu hình tồn tại
    const transport = getTransport();
    if (transport) {
        try {
            const from = process.env.SMTP_FROM || process.env.SMTP_USER;
            await transport.sendMail({
                from: `Locafy <${from}>`,
                to,
                subject: `Mã xác thực Locafy: ${code}`,
                text: `Mã OTP Locafy của bạn là ${code}. Mã có hiệu lực trong 5 phút.`,
                html,
            });
            return { sent: true, provider: 'smtp' };
        } catch (e) {
            console.error('Lỗi khi gửi email qua SMTP fallback:', e.message);
            return { sent: false, reason: e.message };
        }
    }

    return { sent: false, reason: 'Chưa cấu hình mailer (thiếu cả Resend và SMTP)' };
}

module.exports = { sendOtpEmail, isConfigured };
