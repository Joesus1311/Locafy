/* Locafy demo app (no backend): store listings in localStorage */

const STORAGE_KEY = "locafy_listings_v1";

const UNIVERSITY_SEEDS = [
  "Đại học Quốc gia TP.HCM",
  "Đại học Bách Khoa TP.HCM",
  "Đại học Kinh tế - Luật",
  "Đại học Công nghệ Thông tin (UIT)",
  "Đại học Ngoại ngữ - Tin học"
];

const seedListings = [
  {
    id: cryptoRandomId(),
    title: "Phòng trọ sinh viên gác lửng gần ĐH",
    price: 2600000,
    university: "Đại học Quốc gia TP.HCM",
    district: "Thủ Đức",
    contact: "0909 123 456",
    status: "Còn phòng",
    description:
      "Phòng thoáng, có gác lửng, gần các tuyến xe buýt. Điện nước tính theo tháng, an ninh khu vực tốt."
  },
  {
    id: cryptoRandomId(),
    title: "Phòng sạch sẽ, giờ giấc tự do",
    price: 3100000,
    university: "Đại học Bách Khoa TP.HCM",
    district: "Phường 5",
    contact: "mail@example.com",
    status: "Còn phòng",
    description:
      "Có cửa sổ, đầy đủ chỗ để xe, gần chợ và siêu thị. Phù hợp sinh viên cần môi trường yên tĩnh."
  },
  {
    id: cryptoRandomId(),
    title: "Studio mới, gần trường, tiện nghi",
    price: 3900000,
    university: "Đại học Công nghệ Thông tin (UIT)",
    district: "Bình Thạnh",
    contact: "0908 555 222",
    status: "Đang chờ",
    description:
      "Không gian hiện đại, có kệ bếp mini, wifi sẵn. Chủ nhà hỗ trợ nhanh khi có sự cố."
  },
  {
    id: cryptoRandomId(),
    title: "Ký túc xá mini cho 1-2 người",
    price: 2200000,
    university: "Đại học Kinh tế - Luật",
    district: "Cầu Giấy",
    contact: "liensinhvien@domain.com",
    status: "Còn phòng",
    description:
      "Giường nệm mới, có khu vực học tập chung. An toàn, giờ giấc rõ ràng, phù hợp ở lâu dài."
  },
  {
    id: cryptoRandomId(),
    title: "Phòng ban công thoáng mát",
    price: 3400000,
    university: "Đại học Ngoại ngữ - Tin học",
    district: "Quận 10",
    contact: "0901 222 333",
    status: "Đã hết",
    description:
      "Phòng có ban công, nhiều ánh sáng, gần cửa hàng tiện lợi. Tin đã hết phòng nhưng vẫn hiển thị để demo."
  }
];

function cryptoRandomId() {
  // Works in modern browsers
  try {
    const arr = new Uint32Array(4);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((n) => n.toString(16)).join("-");
  } catch {
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function formatVND(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat("vi-VN").format(value) + " VND";
  } catch {
    return `${value} VND`;
  }
}

function loadListings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedListings));
    return seedListings;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedListings;
  } catch {
    return seedListings;
  }
}

function saveListings(listings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

function getUniversities(listings) {
  const set = new Set(listings.map((x) => x.university).filter(Boolean));
  UNIVERSITY_SEEDS.forEach((u) => set.add(u));
  return Array.from(set);
}

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function matchesQuery(listing, query, district, university, maxPrice) {
  const nq = normalize(query);
  const nd = normalize(district);
  const nu = normalize(university);

  const inText =
    !nq ||
    normalize(listing.title).includes(nq) ||
    normalize(listing.description).includes(nq) ||
    normalize(listing.university).includes(nq) ||
    normalize(listing.district).includes(nq);

  const inDistrict = !nd || normalize(listing.district).includes(nd);
  const inUni = !nu || normalize(listing.university).includes(nu);
  const inPrice = !maxPrice || (Number(listing.price) || 0) <= Number(maxPrice);

  return inText && inDistrict && inUni && inPrice;
}

function renderResults({ listings, resultsEl, emptyEl, metaEl }) {
  resultsEl.innerHTML = "";
  emptyEl.hidden = true;

  if (!listings.length) {
    emptyEl.hidden = false;
    if (metaEl) metaEl.textContent = "0 kết quả";
    return;
  }

  if (metaEl) metaEl.textContent = `${listings.length} kết quả`;

  for (const l of listings) {
    const card = document.createElement("article");
    card.className = "room-card";
    card.innerHTML = `
      <div class="room-top">
        <h3 class="room-title">${escapeHtml(l.title || "")}</h3>
        <div class="room-meta">
          <span class="badge">${escapeHtml(l.university || "")}</span>
          <span class="badge status">${escapeHtml(l.status || "")}</span>
        </div>
      </div>
      <div class="room-body">
        <p class="room-desc">${escapeHtml(l.description || "").slice(0, 160)}${
      (l.description || "").length > 160 ? "..." : ""
    }</p>
        <div class="room-bottom">
          <div>
            <div class="price">${formatVND(Number(l.price))}</div>
            <div class="tiny">Khu vực: ${escapeHtml(l.district || "")}</div>
          </div>
          <div class="tiny" style="text-align:right">
            Liên hệ:<br/>
            ${escapeHtml(l.contact || "")}
          </div>
        </div>
      </div>
    `;
    resultsEl.appendChild(card);
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initHomePage() {
  const listings = loadListings();

  const universitySelect = document.getElementById("university");
  const qInput = document.getElementById("q");
  const districtInput = document.getElementById("district");
  const maxPriceInput = document.getElementById("maxPrice");
  const searchForm = document.getElementById("searchForm");
  const resetBtn = document.getElementById("resetBtn");

  const resultsEl = document.getElementById("results");
  const emptyEl = document.getElementById("emptyState");
  const metaEl = document.getElementById("resultsMeta");

  // Fill university select
  const universities = getUniversities(listings).sort((a, b) => a.localeCompare(b, "vi"));
  if (universitySelect) {
    for (const u of universities) {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      universitySelect.appendChild(opt);
    }
  }

  // Render uni chips
  const uniChips = document.getElementById("uniChips");
  if (uniChips) {
    uniChips.innerHTML = "";
    for (const u of universities.slice(0, 8)) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = u;
      chip.addEventListener("click", () => {
        for (const c of uniChips.querySelectorAll(".chip")) c.classList.remove("active");
        chip.classList.add("active");
        if (universitySelect) universitySelect.value = u;
        doSearch();
      });
      uniChips.appendChild(chip);
    }
  }

  function doSearch() {
    const query = qInput?.value || "";
    const district = districtInput?.value || "";
    const university = universitySelect?.value || "";
    const maxPrice = maxPriceInput?.value ? Number(maxPriceInput.value) : "";

    const filtered = listings.filter((l) =>
      matchesQuery(l, query, district, university, maxPrice)
    );

    renderResults({
      listings: filtered,
      resultsEl,
      emptyEl,
      metaEl
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      doSearch();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (qInput) qInput.value = "";
      if (districtInput) districtInput.value = "";
      if (universitySelect) universitySelect.value = "";
      if (maxPriceInput) maxPriceInput.value = "";
      doSearch();
    });
  }

  // First load
  doSearch();
}

function initUploadPage() {
  const roomForm = document.getElementById("roomForm");
  if (!roomForm) return;

  const listings = loadListings();
  const universitySelect = document.getElementById("uni");
  const notice = document.getElementById("formNotice");

  if (universitySelect) {
    universitySelect.innerHTML = `<option value="" selected disabled>Chọn trường</option>`;
    const universities = getUniversities(listings).sort((a, b) => a.localeCompare(b, "vi"));
    for (const u of universities) {
      const opt = document.createElement("option");
      opt.value = u;
      opt.textContent = u;
      universitySelect.appendChild(opt);
    }
  }

  roomForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!notice) return;
    notice.textContent = "";

    const title = document.getElementById("title")?.value?.trim();
    const price = Number(document.getElementById("price")?.value);
    const uni = document.getElementById("uni")?.value;
    const area = document.getElementById("area")?.value?.trim();
    const contact = document.getElementById("contact")?.value?.trim();
    const status = document.getElementById("status")?.value || "Còn phòng";
    const description = document.getElementById("description")?.value?.trim();

    const missing = [];
    if (!title) missing.push("Tên phòng");
    if (!Number.isFinite(price) || price <= 0) missing.push("Giá thuê");
    if (!uni) missing.push("Gần trường");
    if (!area) missing.push("Khu vực");
    if (!contact) missing.push("Liên hệ");
    if (!description) missing.push("Mô tả");

    if (missing.length) {
      notice.textContent = `Vui lòng điền đầy đủ: ${missing.join(", ")}.`;
      notice.style.color = "var(--blue-700)";
      return;
    }

    const next = {
      id: cryptoRandomId(),
      title,
      price,
      university: uni,
      district: area,
      contact,
      status,
      description
    };

    const updated = loadListings();
    updated.unshift(next); // show newest first
    saveListings(updated);

    notice.textContent = "Lưu tin thành công! Đang chuyển hướng về trang chủ...";
    notice.style.color = "var(--blue-700)";

    setTimeout(() => {
      window.location.href = "./index.html";
    }, 900);
  });
}

function init() {
  const isHome = !!document.getElementById("searchForm");
  const isUpload = !!document.getElementById("roomForm");

  if (isHome) initHomePage();
  if (isUpload) initUploadPage();
}

document.addEventListener("DOMContentLoaded", init);

