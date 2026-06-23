/**
 * Ánh xạ dữ liệu giữa DB (snake_case) và API/Client (camelCase).
 * Giữ NGUYÊN shape mà window.db cũ trả về để frontend không phải đổi gì.
 */

const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
};
const int = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
};

// ---------- LISTINGS ----------
const listingToApi = (i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    price: num(i.price),
    location: i.location,
    roomCount: i.room_count,
    layout: i.layout,
    amenities: i.amenities,
    contact: i.contact,
    ownerUsername: i.owner_username,
    image: i.image,
    censored: i.censored,
    rented: i.rented,
    status: i.status,
    tenant: i.tenant,
    createdAt: i.created_at,
});
const listingToDb = (l) => {
    const row = {
        id: l.id,
        title: l.title,
        description: l.description,
        price: num(l.price),
        location: l.location,
        room_count: l.roomCount || '1 phòng',
        layout: l.layout,
        amenities: l.amenities,
        contact: l.contact,
        owner_username: l.ownerUsername,
        image: l.image,
        censored: l.censored === true,
        rented: l.rented === true,
        status: l.status || 'empty',
        tenant: l.tenant || null,
    };
    if (l.createdAt) row.created_at = l.createdAt;
    return row;
};

// ---------- BOOKINGS ----------
const bookingToApi = (i) => ({
    id: i.id,
    tenantName: i.tenant_name,
    tenantPhone: i.tenant_phone,
    ownerUsername: i.owner_username,
    roomTitle: i.room_title,
    roomId: i.room_id,
    date: i.date,
    time: i.time,
    status: i.status,
    depositAmount: i.deposit_amount,
    depositPaid: i.deposit_paid,
    renterEmail: i.renter_email,
});
const bookingToDb = (b) => ({
    id: b.id,
    tenant_name: b.tenantName,
    tenant_phone: b.tenantPhone,
    owner_username: b.ownerUsername,
    room_title: b.roomTitle,
    room_id: b.roomId,
    date: b.date,
    time: b.time,
    status: b.status || 'pending',
    deposit_amount: b.depositAmount,
    deposit_paid: b.depositPaid === true,
    renter_email: b.renterEmail,
});

// ---------- PAYMENTS ----------
const paymentToApi = (i) => ({
    id: i.id,
    title: i.title,
    amount: num(i.amount),
    status: i.status,
    date: i.date,
    dueDate: i.due_date,
    tenantEmail: i.tenant_email,
    ownerUsername: i.owner_username,
    roomTitle: i.room_title,
    paymentMethod: i.payment_method,
    roomId: i.room_id,
});
const paymentToDb = (p) => ({
    id: p.id,
    title: p.title,
    amount: num(p.amount),
    status: p.status,
    date: p.date,
    due_date: p.dueDate,
    tenant_email: p.tenantEmail,
    owner_username: p.ownerUsername,
    room_title: p.roomTitle,
    payment_method: p.paymentMethod,
    room_id: p.roomId,
});

// ---------- MAINTENANCE ----------
const maintenanceToApi = (i) => ({
    id: i.id,
    tenantName: i.tenant_name,
    roomTitle: i.room_title,
    type: i.type,
    description: i.description,
    status: i.status,
    priority: i.priority,
    date: i.date,
    ownerUsername: i.owner_username,
    image: i.image,
    renterEmail: i.renter_email,
});
const maintenanceToDb = (m) => ({
    id: m.id,
    tenant_name: m.tenantName,
    room_title: m.roomTitle,
    type: m.type,
    description: m.description,
    status: m.status || 'pending',
    priority: m.priority || 'medium',
    date: m.date,
    owner_username: m.ownerUsername,
    image: m.image,
    renter_email: m.renterEmail,
});

// ---------- CONTRACTS ----------
const contractToApi = (i) => ({
    id: i.id,
    roomId: i.room_id,
    roomTitle: i.room_title,
    price: num(i.price),
    depositMonths: int(i.deposit_months),
    duration: int(i.duration),
    ownerUsername: i.owner_username,
    renterName: i.renter_name,
    renterId: i.renter_id,
    renterPhone: i.renter_phone,
    renterEmail: i.renter_email,
    signatureA: i.signature_a,
    signatureB: i.signature_b,
    status: i.status,
    createdAt: i.created_at,
});
const contractToDb = (c) => {
    const row = {
        id: c.id,
        room_id: c.roomId,
        room_title: c.roomTitle,
        price: num(c.price),
        deposit_months: int(c.depositMonths),
        duration: int(c.duration),
        owner_username: c.ownerUsername,
        renter_name: c.renterName,
        renter_id: c.renterId,
        renter_phone: c.renterPhone,
        renter_email: c.renterEmail,
        signature_a: c.signatureA,
        signature_b: c.signatureB,
        status: c.status || 'pending_renter',
    };
    if (c.createdAt) row.created_at = c.createdAt;
    return row;
};

// ---------- NOTIFICATIONS ----------
const notificationToApi = (i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    type: i.type,
    read: i.read,
    date: i.date,
    renterEmail: i.renter_email,
});
const notificationToDb = (n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    type: n.type,
    read: n.read === true,
    date: n.date,
    renter_email: n.renterEmail,
});

// ---------- ACCOUNTS ----------
const accountToApi = (i) => ({
    username: i.username,
    email: i.email,
    role: i.role,
    name: i.name,
    phone: i.phone,
    verified: i.verified,
    doc_url: i.doc_url,
    isBlocked: i.is_blocked || false,
    created_at: i.created_at,
});
const accountToDb = (a) => {
    const row = {
        username: a.username,
        email: a.email,
        role: a.role,
        name: a.name,
        phone: a.phone,
        verified: a.verified === true,
        doc_url: a.doc_url || a.docUrl || null,
    };
    if (a.password !== undefined) row.password = a.password;
    if (a.isBlocked !== undefined) row.is_blocked = a.isBlocked === true;
    return row;
};

module.exports = {
    listings: { table: 'locafy_listings', pk: 'id', toApi: listingToApi, toDb: listingToDb },
    bookings: { table: 'locafy_bookings', pk: 'id', toApi: bookingToApi, toDb: bookingToDb },
    payments: { table: 'locafy_payments', pk: 'id', toApi: paymentToApi, toDb: paymentToDb },
    maintenance: { table: 'locafy_maintenance', pk: 'id', toApi: maintenanceToApi, toDb: maintenanceToDb },
    contracts: { table: 'locafy_contracts', pk: 'id', toApi: contractToApi, toDb: contractToDb },
    notifications: { table: 'locafy_notifications', pk: 'id', toApi: notificationToApi, toDb: notificationToDb },
    accounts: { table: 'locafy_accounts', pk: 'username', toApi: accountToApi, toDb: accountToDb },
};
