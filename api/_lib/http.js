/**
 * Tiện ích HTTP dùng chung cho các serverless function.
 */

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function send(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
}

/**
 * Đọc body JSON một cách an toàn (Vercel thường tự parse, nhưng vẫn fallback đọc stream).
 */
async function readBody(req) {
    if (req.body && typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string' && req.body.trim()) {
        try {
            return JSON.parse(req.body);
        } catch (_) {
            return {};
        }
    }
    return await new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch (_) {
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}

module.exports = { setCors, send, readBody };
