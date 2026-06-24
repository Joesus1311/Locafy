const fs = require('fs');
const path = require('path');

// Danh sách các biến an toàn được phép lộ ra phía Client-side (env.js)
// LƯU Ý BẢO MẬT: Tuyệt đối KHÔNG đưa SUPABASE_SECRET_KEY vào đây!
const keysToExpose = [
    'SUPABASE_URL',
    'SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_JWKS_URL',
    'GOOGLE_ANALYTICS_ID',
    'GOOGLE_SITE_VERIFICATION'
];

let rawEnv = {};
const envPath = path.join(__dirname, '.env');

// 1. Đọc file .env nếu tồn tại
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split(/\r?\n/);
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const firstEquals = trimmed.indexOf('=');
            if (firstEquals === -1) return;

            const key = trimmed.substring(0, firstEquals).trim();
            const value = trimmed.substring(firstEquals + 1).trim();

            if (key) {
                let cleanValue = value;
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    cleanValue = value.substring(1, value.length - 1);
                }
                rawEnv[key] = cleanValue;
            }
        });
        console.log('Loaded local .env file successfully.');
    } catch (err) {
        console.warn('Could not read .env file, fallback to system env:', err.message);
    }
}

// 2. Nạp thêm các biến từ môi trường thực tế (khi chạy trên Vercel)
keysToExpose.forEach(key => {
    if (process.env[key]) {
        rawEnv[key] = process.env[key];
    }
});

// 3. Lọc chỉ giữ lại các key an toàn để xuất ra Client
let clientEnv = {};
keysToExpose.forEach(key => {
    if (rawEnv[key] !== undefined) {
        clientEnv[key] = rawEnv[key];
    }
});

// 4. Sinh mã JS gán vào đối tượng window.env
const envJsContent = `// Tự động sinh bởi generate-env.js - KHÔNG SỬA TRỰC TIẾP FILE NÀY
window.env = ${JSON.stringify(clientEnv, null, 4)};
`;

// 5. Ghi đè file env.js
fs.writeFileSync(path.join(__dirname, 'env.js'), envJsContent, 'utf8');
console.log('Generated env.js with client-safe variables:', Object.keys(clientEnv));
if (rawEnv['SUPABASE_SECRET_KEY']) {
    console.log('Security check: SUPABASE_SECRET_KEY is stored in .env but successfully EXCLUDED from env.js.');
}
