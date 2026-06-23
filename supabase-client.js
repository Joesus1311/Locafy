/**
 * Locafy Data Layer — gọi REST API (/api) làm nguồn dữ liệu chính.
 *
 * window.db giữ NGUYÊN các method/shape cũ để mọi trang đang dùng không phải sửa.
 * Nếu API lỗi mạng (offline / chưa deploy), tự động fallback sang localStorage.
 *
 * Bảo mật: toàn bộ truy cập DB đi qua server (service key ở server), client KHÔNG còn
 * giữ khóa Supabase. Mật khẩu được hash (bcrypt) và OTP gửi qua email ở phía server.
 */
(function () {
    const API_BASE = (window.env && window.env.API_BASE) || '/api';

    async function apiGet(path) {
        const res = await fetch(API_BASE + path, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('API GET ' + path + ' -> ' + res.status);
        return res.json();
    }

    async function apiSend(method, path, body) {
        const res = await fetch(API_BASE + path, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || 'API ' + method + ' ' + path + ' -> ' + res.status);
            err.status = res.status;
            err.data = data;
            throw err;
        }
        return data;
    }

    // Expose cho các trang auth (login/register) dùng trực tiếp
    window.LocafyApi = { base: API_BASE, get: apiGet, send: apiSend };

    // ---- localStorage helpers (fallback offline) ----
    const lsGet = (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (_) {
            return [];
        }
    };
    const lsSet = (key, val) => localStorage.setItem(key, JSON.stringify(val));

    function upsertLocal(key, item, matchFn) {
        const arr = lsGet(key);
        const idx = arr.findIndex(matchFn);
        if (idx !== -1) arr[idx] = item;
        else arr.push(item);
        lsSet(key, arr);
    }

    window.db = {
        // ---------- Accounts ----------
        async getAccounts() {
            try {
                return await apiGet('/accounts');
            } catch (e) {
                console.warn('[db] getAccounts fallback localStorage:', e.message);
                return lsGet('locafyAccounts');
            }
        },
        async saveAccount(account) {
            try {
                return await apiSend('POST', '/accounts', account);
            } catch (e) {
                console.warn('[db] saveAccount fallback localStorage:', e.message);
                upsertLocal('locafyAccounts', account, (a) => a.username === account.username);
            }
        },

        // ---------- Listings ----------
        async getListings() {
            try {
                return await apiGet('/listings');
            } catch (e) {
                console.warn('[db] getListings fallback localStorage:', e.message);
                return lsGet('locafySellerListings');
            }
        },
        async saveListing(listing) {
            try {
                return await apiSend('POST', '/listings', listing);
            } catch (e) {
                console.warn('[db] saveListing fallback localStorage:', e.message);
                upsertLocal('locafySellerListings', listing, (l) => l.id === listing.id);
            }
        },
        async deleteListing(id) {
            try {
                return await apiSend('DELETE', '/listings/' + encodeURIComponent(id));
            } catch (e) {
                console.warn('[db] deleteListing fallback localStorage:', e.message);
                lsSet('locafySellerListings', lsGet('locafySellerListings').filter((l) => l.id !== id));
            }
        },

        // ---------- Bookings ----------
        async getBookings() {
            try {
                return await apiGet('/bookings');
            } catch (e) {
                console.warn('[db] getBookings fallback localStorage:', e.message);
                return lsGet('locafyBookings');
            }
        },
        async saveBooking(booking) {
            try {
                return await apiSend('POST', '/bookings', booking);
            } catch (e) {
                console.warn('[db] saveBooking fallback localStorage:', e.message);
                upsertLocal('locafyBookings', booking, (b) => b.id === booking.id);
            }
        },

        // ---------- Payments ----------
        async getPayments() {
            try {
                return await apiGet('/payments');
            } catch (e) {
                console.warn('[db] getPayments fallback localStorage:', e.message);
                return lsGet('locafyPayments');
            }
        },
        async savePayment(payment) {
            try {
                return await apiSend('POST', '/payments', payment);
            } catch (e) {
                console.warn('[db] savePayment fallback localStorage:', e.message);
                upsertLocal('locafyPayments', payment, (p) => p.id === payment.id);
            }
        },

        // ---------- Maintenance ----------
        async getMaintenance() {
            try {
                return await apiGet('/maintenance');
            } catch (e) {
                console.warn('[db] getMaintenance fallback localStorage:', e.message);
                return lsGet('locafyMaintenance');
            }
        },
        async saveMaintenance(item) {
            try {
                return await apiSend('POST', '/maintenance', item);
            } catch (e) {
                console.warn('[db] saveMaintenance fallback localStorage:', e.message);
                upsertLocal('locafyMaintenance', item, (m) => m.id === item.id);
            }
        },

        // ---------- Contracts ----------
        async getContracts() {
            try {
                return await apiGet('/contracts');
            } catch (e) {
                console.warn('[db] getContracts fallback localStorage:', e.message);
                return lsGet('locafyContracts');
            }
        },
        async saveContract(contract) {
            try {
                return await apiSend('POST', '/contracts', contract);
            } catch (e) {
                console.warn('[db] saveContract fallback localStorage:', e.message);
                upsertLocal('locafyContracts', contract, (c) => c.id === contract.id);
            }
        },

        // ---------- Notifications ----------
        async getNotifications() {
            try {
                return await apiGet('/notifications');
            } catch (e) {
                console.warn('[db] getNotifications fallback localStorage:', e.message);
                return lsGet('locafyNotifications');
            }
        },
        async saveNotification(notif) {
            try {
                return await apiSend('POST', '/notifications', notif);
            } catch (e) {
                console.warn('[db] saveNotification fallback localStorage:', e.message);
                upsertLocal('locafyNotifications', notif, (n) => n.id === notif.id);
            }
        },

        // ---------- Chats ----------
        async getChats(chatId, currentUserUsername) {
            try {
                const qs =
                    '?chatId=' + encodeURIComponent(chatId) + '&user=' + encodeURIComponent(currentUserUsername || '');
                return await apiGet('/chats' + qs);
            } catch (e) {
                console.warn('[db] getChats fallback localStorage:', e.message);
                const chats = JSON.parse(localStorage.getItem('locafyChats') || '{}');
                return chats[chatId] || [];
            }
        },
        async saveChatMessage(chatId, message, currentUserUsername) {
            try {
                return await apiSend('POST', '/chats', { chatId, message, currentUser: currentUserUsername });
            } catch (e) {
                console.warn('[db] saveChatMessage fallback localStorage:', e.message);
                const chats = JSON.parse(localStorage.getItem('locafyChats') || '{}');
                if (!chats[chatId]) chats[chatId] = [];
                chats[chatId].push(message);
                localStorage.setItem('locafyChats', JSON.stringify(chats));
            }
        },

        // ---------- Delete helpers ----------
        async deleteAccount(username) {
            try {
                return await apiSend('DELETE', '/accounts/' + encodeURIComponent(username));
            } catch (e) {
                console.warn('[db] deleteAccount fallback localStorage:', e.message);
                lsSet('locafyAccounts', lsGet('locafyAccounts').filter((a) => a.username !== username));
            }
        },
        async deleteBooking(id) {
            try {
                return await apiSend('DELETE', '/bookings/' + encodeURIComponent(id));
            } catch (e) {
                console.warn('[db] deleteBooking fallback localStorage:', e.message);
                lsSet('locafyBookings', lsGet('locafyBookings').filter((b) => b.id !== id));
            }
        },
        async deleteMaintenance(id) {
            try {
                return await apiSend('DELETE', '/maintenance/' + encodeURIComponent(id));
            } catch (e) {
                console.warn('[db] deleteMaintenance fallback localStorage:', e.message);
                lsSet('locafyMaintenance', lsGet('locafyMaintenance').filter((m) => m.id !== id));
            }
        },
        async deleteNotification(id) {
            try {
                return await apiSend('DELETE', '/notifications/' + encodeURIComponent(id));
            } catch (e) {
                console.warn('[db] deleteNotification fallback localStorage:', e.message);
                lsSet('locafyNotifications', lsGet('locafyNotifications').filter((n) => n.id !== id));
            }
        },
        async deleteContract(id) {
            try {
                return await apiSend('DELETE', '/contracts/' + encodeURIComponent(id));
            } catch (e) {
                console.warn('[db] deleteContract fallback localStorage:', e.message);
                lsSet('locafyContracts', lsGet('locafyContracts').filter((c) => c.id !== id));
            }
        },
        async deletePayment(id) {
            try {
                return await apiSend('DELETE', '/payments/' + encodeURIComponent(id));
            } catch (e) {
                console.warn('[db] deletePayment fallback localStorage:', e.message);
                lsSet('locafyPayments', lsGet('locafyPayments').filter((p) => p.id !== id));
            }
        },
    };
})();
