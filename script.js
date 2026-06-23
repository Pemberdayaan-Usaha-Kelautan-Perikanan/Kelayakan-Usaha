let hasilTerakhir = null;
const MINGGU_PER_BULAN = 4.33;

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const el = byId(id);
  if (el) el.innerText = value;
}

function setHTML(id, value) {
  const el = byId(id);
  if (el) el.innerHTML = value;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setValue(id, value) {
  const el = byId(id);
  if (el) el.value = value;
}

function getValue(id) {
  const el = byId(id);
  return el ? el.value : "";
}

function cleanNumber(value) {
  return Number(
    String(value || "")
      .replace(/\./g, "")
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "")
  ) || 0;
}

function getNumber(id) {
  return cleanNumber(getValue(id));
}

/* ======================================================
   FORMAT ANGKA RAPI UNTUK SEMUA KPI
====================================================== */

function formatAngka(value) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatCompact(value, satuan = "") {
  const angka = Number(value || 0);
  const abs = Math.abs(angka);

  let hasil;

  if (abs >= 1000000000000) {
    hasil =
      (angka / 1000000000000).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " T";
  } else if (abs >= 1000000000) {
    hasil =
      (angka / 1000000000).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " M";
  } else if (abs >= 1000000) {
    hasil =
      (angka / 1000000).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " jt";
  } else if (abs >= 1000) {
    hasil =
      (angka / 1000).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " rb";
  } else {
    hasil = angka.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  return satuan ? `${hasil} ${satuan}` : hasil;
}

function rupiah(value) {
  return "Rp " + formatCompact(value);
}

function rupiahFull(value) {
  return "Rp " + formatAngka(value || 0);
}

function rupiahPerKg(value) {
  return "Rp " + formatCompact(value) + " /kg";
}

function formatMoneyParts(value) {
  const angka = Number(value || 0);
  const abs = Math.abs(angka);
  let divisor = 1;
  let unit = "";
  let digits = 0;

  if (abs >= 1000000000000) {
    divisor = 1000000000000;
    unit = "T";
    digits = 2;
  } else if (abs >= 1000000000) {
    divisor = 1000000000;
    unit = "M";
    digits = 2;
  } else if (abs >= 1000000) {
    divisor = 1000000;
    unit = "jt";
    digits = 2;
  } else if (abs >= 1000) {
    divisor = 1000;
    unit = "rb";
    digits = 2;
  }

  const number = (abs / divisor).toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

  return {
    negative: angka < 0,
    number,
    unit
  };
}

function rupiahHTML(value, suffix = "") {
  const part = formatMoneyParts(value);
  return `
    <span class="money-value ${part.negative ? "negative" : ""}">
      <span class="money-currency">Rp</span>
      <span class="money-number">${part.negative ? "−" : ""}${part.number}</span>
      ${part.unit ? `<span class="money-unit">${part.unit}</span>` : ""}
      ${suffix ? `<span class="money-suffix">${escapeHTML(suffix)}</span>` : ""}
    </span>
  `;
}

function rupiahPerKgHTML(value) {
  return rupiahHTML(value, "/kg");
}

function persenSatuDigit(value) {
  return `${Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

function persen(value) {
  return `${Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

function desimal(value) {
  return Number(value || 0).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatKg(value) {
  const angka = Number(value || 0);

  if (angka >= 1000) {
    return `${(angka / 1000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ton`;
  }

  return `${formatAngka(angka)} kg`;
}

function formatInputRupiah(input) {
  const angka = input.value.replace(/\D/g, "");
  input.value = angka ? formatAngka(Number(angka)) : "";
}

function aktifkanFormatRupiah() {
  document.querySelectorAll(".input-rupiah").forEach((input) => {
    input.oninput = function () {
      formatInputRupiah(this);
    };
  });
}

/* ======================================================
   SIDEBAR
====================================================== */

function toggleSidebar() {
  document.body.classList.toggle("sidebar-collapsed");

  const btn = byId("floatingSidebarToggle");
  const collapsed = document.body.classList.contains("sidebar-collapsed");

  if (btn) {
    btn.innerText = collapsed ? "☰" : "‹";
    btn.setAttribute(
      "aria-label",
      collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"
    );
  }
}

/* ======================================================
   LOGIN
====================================================== */

function loginApp() {
  const nama = getValue("loginNama").trim() || "Pengguna";
  const instansi = getValue("loginInstansi").trim() || "-";
  const role = getValue("loginRole") || "user";
  const wilayah = getValue("loginWilayah") || "-";

  localStorage.setItem(
    "knmpInvestorUser",
    JSON.stringify({ nama, instansi, role, wilayah })
  );

  setText("userGreeting", `Halo, ${nama} | ${instansi}`);

  byId("loginScreen").classList.add("hidden");
  byId("app").classList.remove("hidden");
}

function logoutApp() {
  localStorage.removeItem("knmpInvestorUser");
  byId("app").classList.add("hidden");
  byId("loginScreen").classList.remove("hidden");
}

/* ======================================================
   STANDAR USAHA
====================================================== */

const standarUsaha = {
  pindang: {
    hariKerja: 25,
    tenagaKerja: 12,
    upah: 2300000
  },

  fillet: {
    hariKerja: 25,
    tenagaKerja: 10,
    upah: 2500000,
    jenisIkan: "Tongkol Fillet",
    ikanPerHari: 2000,
    rendemen: 55,
    hargaBeli: 25000,
    hargaJual: 52000
  },

  coldstorage: {
    hariKerja: 30,
    tenagaKerja: 6,
    upah: 2800000,
    jenisIkan: "Jasa Cold Storage",
    ikanPerHari: 5000,
    rendemen: 95,
    hargaBeli: 0,
    hargaJual: 450
  },

  bioflok: {
    hariKerja: 1,
    tenagaKerja: 4,
    upah: 2200000,
    jenisIkan: "Lele",
    ikanPerHari: 3000,
    rendemen: 90,
    hargaBeli: 18000,
    hargaJual: 24000
  },

  tuna: {
    hariKerja: 25,
    tenagaKerja: 69,
    upah: 3500000,
    jenisIkan: "Tuna Loin",
    ikanPerHari: 7600,
    rendemen: 47,
    hargaBeli: 55000,
    hargaJual: 160000
  }
};

function namaJenisUsaha(value) {
  const map = {
    pindang: "Pemindangan Ikan",
    fillet: "Pengolahan Fillet Ikan",
    coldstorage: "Cold Storage",
    bioflok: "Budidaya Bioflok",
    tuna: "Pengolahan Tuna Loin",
    custom: "Usaha Perikanan Lainnya"
  };

  return map[value] || "Usaha Perikanan";
}

function gantiJenisUsaha() {
  const jenis = getValue("jenisUsaha");

  if (jenis === "pindang") {
    byId("pindangInputBox").classList.remove("hidden");
    byId("umumInputBox").classList.add("hidden");
  } else {
    byId("pindangInputBox").classList.add("hidden");
    byId("umumInputBox").classList.remove("hidden");
  }

  if (getValue("sumberData") === "Angka Standar Sistem") {
    isiDataStandar();
  }
}

function gantiSumberData() {
  if (getValue("sumberData") === "Angka Standar Sistem") {
    isiDataStandar();
  }
}

function isiDataStandar() {
  const jenis = getValue("jenisUsaha");
  const data = standarUsaha[jenis];

  if (!data) return;

  setValue("hariKerja", data.hariKerja || 25);
  setValue("tenagaKerja", data.tenagaKerja || 0);
  setValue("upah", formatAngka(data.upah || 0));

  if (jenis !== "pindang") {
    setValue("jenisIkanUmum", data.jenisIkan || "");
    setValue("ikanPerHari", data.ikanPerHari || 0);
    setValue("rendemenUmum", data.rendemen || 0);
    setValue("hargaBeliUmum", formatAngka(data.hargaBeli || 0));
    setValue("hargaJualUmum", formatAngka(data.hargaJual || 0));
  }
}

/* ======================================================
   TAMBAH / HAPUS BARIS
====================================================== */

function tambahBarisIkan() {
  const tbody = byId("ikanBody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="ikan-nama" placeholder="Nama ikan / produk" /></td>
    <td><input type="number" class="ikan-volume" value="0" /></td>
    <td><input type="number" class="ikan-rendemen" value="85" /></td>
    <td><input class="ikan-harga-beli input-rupiah" value="0" /></td>
    <td><input class="ikan-harga-jual input-rupiah" value="0" /></td>
    <td><button class="danger small-button" onclick="hapusBarisIkan(this)">Hapus</button></td>
  `;

  tbody.appendChild(tr);
  aktifkanFormatRupiah();
}

function hapusBarisIkan(button) {
  const rows = document.querySelectorAll("#ikanBody tr");

  if (rows.length <= 1) {
    alert("Minimal harus ada 1 baris ikan / produk.");
    return;
  }

  button.closest("tr").remove();
}

function tambahBarisBiayaVariabel() {
  const tbody = byId("biayaVariabelBody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="biaya-var-nama" placeholder="Komponen HPP" /></td>
    <td>
      <select class="biaya-var-satuan">
        <option value="produk">Per kg produk jadi</option>
        <option value="bahanBaku">Per kg bahan baku</option>
      </select>
    </td>
    <td><input class="biaya-var-nilai input-rupiah" value="0" /></td>
    <td><button class="danger small-button" onclick="hapusBarisBiaya(this)">Hapus</button></td>
  `;

  tbody.appendChild(tr);
  aktifkanFormatRupiah();
}

function tambahBarisBiayaTetap() {
  const tbody = byId("biayaTetapBody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="biaya-tetap-nama" placeholder="Komponen operasional" /></td>
    <td><input class="biaya-tetap-nilai input-rupiah" value="0" /></td>
    <td><button class="danger small-button" onclick="hapusBarisBiaya(this)">Hapus</button></td>
  `;

  tbody.appendChild(tr);
  aktifkanFormatRupiah();
}

function hapusBarisBiaya(button) {
  const tbody = button.closest("tbody");
  const rows = tbody.querySelectorAll("tr");

  if (rows.length <= 1) {
    alert("Minimal harus ada 1 baris biaya.");
    return;
  }

  button.closest("tr").remove();
}

function tambahBarisInvestasi() {
  const tbody = byId("investasiBody");
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input class="investasi-nama" placeholder="Komponen investasi" /></td>
    <td><input class="investasi-nilai input-rupiah" value="0" /></td>
    <td><input type="number" class="investasi-umur" value="5" /></td>
    <td><button class="danger small-button" onclick="hapusBarisInvestasi(this)">Hapus</button></td>
  `;

  tbody.appendChild(tr);
  aktifkanFormatRupiah();
  hitungTotalInvestasiPreview();
}

function hapusBarisInvestasi(button) {
  const rows = document.querySelectorAll("#investasiBody tr");

  if (rows.length <= 1) {
    alert("Minimal harus ada 1 komponen investasi.");
    return;
  }

  button.closest("tr").remove();
  hitungTotalInvestasiPreview();
}

/* ======================================================
   SKENARIO
====================================================== */

function getSkenario() {
  const value = document.querySelector('input[name="skenario"]:checked')?.value || "normal";

  if (value === "hatiHati") {
    return {
      kode: "hatiHati",
      nama: "Hati-hati",
      produksi: 0.85,
      harga: 0.9,
      biaya: 1.1
    };
  }

  if (value === "baik") {
    return {
      kode: "baik",
      nama: "Baik",
      produksi: 1.1,
      harga: 1.05,
      biaya: 0.95
    };
  }

  return {
    kode: "normal",
    nama: "Normal",
    produksi: 1,
    harga: 1,
    biaya: 1
  };
}

/* ======================================================
   PRODUKSI
====================================================== */

function ambilDataProduksi() {
  const jenis = getValue("jenisUsaha");
  const skenario = getSkenario();

  let bahanBakuBulanan = 0;
  let produkJadiBulanan = 0;
  let pendapatanBulanan = 0;
  let biayaBahanBakuBulanan = 0;

  let totalHargaBeliTertimbang = 0;
  let totalHargaJualTertimbang = 0;

  const komposisi = [];

  if (jenis === "pindang") {
    const rows = document.querySelectorAll("#ikanBody tr");

    rows.forEach((row) => {
      const nama = row.querySelector(".ikan-nama")?.value || "Produk";
      const volumeMinggu = cleanNumber(row.querySelector(".ikan-volume")?.value);
      const rendemen = cleanNumber(row.querySelector(".ikan-rendemen")?.value) / 100;
      const hargaBeli = cleanNumber(row.querySelector(".ikan-harga-beli")?.value);
      const hargaJual = cleanNumber(row.querySelector(".ikan-harga-jual")?.value);

      const volumeBulanan = volumeMinggu * MINGGU_PER_BULAN * skenario.produksi;
      const produkJadi = volumeBulanan * rendemen;
      const biayaBahanBaku = volumeBulanan * hargaBeli * skenario.biaya;
      const pendapatan = produkJadi * hargaJual * skenario.harga;

      bahanBakuBulanan += volumeBulanan;
      produkJadiBulanan += produkJadi;
      biayaBahanBakuBulanan += biayaBahanBaku;
      pendapatanBulanan += pendapatan;

      totalHargaBeliTertimbang += hargaBeli * volumeBulanan;
      totalHargaJualTertimbang += hargaJual * produkJadi;

      komposisi.push({
        nama,
        volumeBulanan,
        produkJadi,
        rendemen,
        hargaBeli,
        hargaJual: hargaJual * skenario.harga,
        pendapatan,
        biayaBahanBaku
      });
    });
  } else {
    const nama = getValue("jenisIkanUmum") || "Produk";
    const ikanPerHari = getNumber("ikanPerHari");
    const hariKerja = getNumber("hariKerja");
    const rendemen = getNumber("rendemenUmum") / 100;
    const hargaBeli = getNumber("hargaBeliUmum");
    const hargaJual = getNumber("hargaJualUmum") * skenario.harga;

    bahanBakuBulanan = ikanPerHari * hariKerja * skenario.produksi;
    produkJadiBulanan = bahanBakuBulanan * rendemen;
    biayaBahanBakuBulanan = bahanBakuBulanan * hargaBeli * skenario.biaya;
    pendapatanBulanan = produkJadiBulanan * hargaJual;

    totalHargaBeliTertimbang = hargaBeli * bahanBakuBulanan;
    totalHargaJualTertimbang = hargaJual * produkJadiBulanan;

    komposisi.push({
      nama,
      volumeBulanan: bahanBakuBulanan,
      produkJadi: produkJadiBulanan,
      rendemen,
      hargaBeli,
      hargaJual,
      pendapatan: pendapatanBulanan,
      biayaBahanBaku: biayaBahanBakuBulanan
    });
  }

  const hargaBeliRataRata =
    bahanBakuBulanan > 0 ? totalHargaBeliTertimbang / bahanBakuBulanan : 0;

  const hargaJualRataRataInput =
    produkJadiBulanan > 0 ? totalHargaJualTertimbang / produkJadiBulanan : 0;

  return {
    bahanBakuBulanan,
    produkJadiBulanan,
    pendapatanBulanan,
    biayaBahanBakuBulanan,
    hargaBeliRataRata,
    hargaJualRataRataInput,
    komposisi
  };
}

/* ======================================================
   BIAYA
====================================================== */

function ambilBiayaVariabel(bahanBakuBulanan, produkJadiBulanan) {
  const skenario = getSkenario();
  const rows = document.querySelectorAll("#biayaVariabelBody tr");

  let total = 0;
  const data = [];

  rows.forEach((row) => {
    const nama = row.querySelector(".biaya-var-nama")?.value || "Komponen HPP";
    const satuan = row.querySelector(".biaya-var-satuan")?.value || "produk";
    const nilai = cleanNumber(row.querySelector(".biaya-var-nilai")?.value);

    const basis = satuan === "bahanBaku" ? bahanBakuBulanan : produkJadiBulanan;
    const totalBiaya = basis * nilai * skenario.biaya;

    total += totalBiaya;

    data.push({
      nama,
      satuan,
      nilai,
      basis,
      totalBiaya
    });
  });

  return { total, data };
}

function ambilBiayaTetap() {
  const skenario = getSkenario();
  const rows = document.querySelectorAll("#biayaTetapBody tr");

  let total = 0;
  const data = [];

  rows.forEach((row) => {
    const nama = row.querySelector(".biaya-tetap-nama")?.value || "Biaya Operasional";
    const nilai = cleanNumber(row.querySelector(".biaya-tetap-nilai")?.value);
    const totalBiaya = nilai * skenario.biaya;

    total += totalBiaya;
    data.push({ nama, nilai, totalBiaya });
  });

  return { total, data };
}

function hitungTenagaKerja() {
  return getNumber("tenagaKerja") * getNumber("upah");
}

/* ======================================================
   INVESTASI
====================================================== */

function ambilInvestasi() {
  const rows = document.querySelectorAll("#investasiBody tr");

  let totalInvestasi = 0;
  let totalPenyusutanBulanan = 0;
  const data = [];

  rows.forEach((row) => {
    const nama = row.querySelector(".investasi-nama")?.value || "Investasi";
    const nilai = cleanNumber(row.querySelector(".investasi-nilai")?.value);
    const umur = cleanNumber(row.querySelector(".investasi-umur")?.value) || 1;

    const penyusutanBulanan = nilai / (umur * 12);

    totalInvestasi += nilai;
    totalPenyusutanBulanan += penyusutanBulanan;

    data.push({
      nama,
      nilai,
      umur,
      penyusutanBulanan
    });
  });

  setValue("investasi", formatAngka(totalInvestasi));
  setValue("penyusutanBulanan", formatAngka(totalPenyusutanBulanan));

  return {
    totalInvestasi,
    totalNilaiSisa: 0,
    totalPenyusutanBulanan,
    data
  };
}

function hitungTotalInvestasiPreview() {
  ambilInvestasi();
}

/* ======================================================
   FINANCIAL FORMULA
====================================================== */

function hitungNPV(cashflows, discountRate) {
  return cashflows.reduce((total, cf, index) => {
    return total + cf / Math.pow(1 + discountRate, index);
  }, 0);
}

function hitungIRR(cashflows) {
  let low = -0.99;
  let high = 10;

  for (let i = 0; i < 150; i++) {
    const mid = (low + high) / 2;
    const npv = hitungNPV(cashflows, mid);

    if (npv > 0) low = mid;
    else high = mid;
  }

  const irr = ((low + high) / 2) * 100;
  return isFinite(irr) ? irr : 0;
}

function formatPP(bulan) {
  if (!isFinite(bulan) || bulan <= 0) return "Belum balik modal";

  const tahun = Math.floor(bulan / 12);
  const sisaBulan = Math.round(bulan % 12);

  if (tahun <= 0) return `${sisaBulan} bulan`;
  if (sisaBulan === 0) return `${tahun} tahun`;

  return `${tahun} tahun ${sisaBulan} bulan`;
}

/* ======================================================
   VALIDASI
====================================================== */

function validasiInputUsaha() {
  const pesan = [];

  const produksi = ambilDataProduksi();
  const investasi = ambilInvestasi();

  if (produksi.bahanBakuBulanan <= 0) pesan.push("Bahan baku belum valid.");
  if (produksi.produkJadiBulanan <= 0) pesan.push("Produk jadi belum valid.");
  if (produksi.pendapatanBulanan <= 0) pesan.push("Pendapatan belum valid.");
  if (investasi.totalInvestasi <= 0) pesan.push("Total investasi harus lebih dari Rp 0.");
  if (getNumber("periodeProyeksi") <= 0) pesan.push("Periode proyeksi harus lebih dari 0.");
  if (getNumber("discountRate") < 0) pesan.push("Discount rate tidak boleh negatif.");

  const box = byId("validasiInput");

  if (pesan.length > 0) {
    box.className = "validation-box error";
    box.innerHTML = pesan.map((p) => `• ${p}`).join("<br>");
    return false;
  }

  box.className = "validation-box success";
  box.innerText = "Data lengkap dan siap dihitung.";
  return true;
}

/* ======================================================
   MAIN ENGINE
====================================================== */

function hitungKelayakan() {
  if (!validasiInputUsaha()) return;

  const jenisUsaha = getValue("jenisUsaha");
  const skenario = getSkenario();

  const produksi = ambilDataProduksi();
  const biayaVariabel = ambilBiayaVariabel(
    produksi.bahanBakuBulanan,
    produksi.produkJadiBulanan
  );
  const biayaTetap = ambilBiayaTetap();
  const investasi = ambilInvestasi();

  const biayaTenagaKerja = hitungTenagaKerja();

  const hppTotal = produksi.biayaBahanBakuBulanan + biayaVariabel.total;

  const hppPerKg =
    produksi.produkJadiBulanan > 0 ? hppTotal / produksi.produkJadiBulanan : 0;

  const labaKotor = produksi.pendapatanBulanan - hppTotal;
  const biayaOperasional = biayaTetap.total + biayaTenagaKerja;
  const labaBersih = labaKotor - biayaOperasional;

  const hargaJualRataRata =
    produksi.produkJadiBulanan > 0
      ? produksi.pendapatanBulanan / produksi.produkJadiBulanan
      : 0;

  const marginBersih =
    produksi.pendapatanBulanan > 0
      ? (labaBersih / produksi.pendapatanBulanan) * 100
      : 0;

  const rasioHPP =
    hargaJualRataRata > 0 ? (hppPerKg / hargaJualRataRata) * 100 : 0;

  const periode = getNumber("periodeProyeksi");
  const discountRate = getNumber("discountRate") / 100;
  const kenaikanPendapatan = getNumber("kenaikanPendapatan") / 100;
  const kenaikanBiaya = getNumber("kenaikanBiaya") / 100;

  const cashflows = [-investasi.totalInvestasi];
  const cashflowRows = [];

  let pvBenefit = 0;
  let pvCost = investasi.totalInvestasi;
  let akumulasiCashflow = -investasi.totalInvestasi;

  for (let tahun = 1; tahun <= periode; tahun++) {
    const faktorPendapatan = Math.pow(1 + kenaikanPendapatan, tahun - 1);
    const faktorBiaya = Math.pow(1 + kenaikanBiaya, tahun - 1);

    const pendapatanTahunan = produksi.pendapatanBulanan * 12 * faktorPendapatan;
    const hppTahunan = hppTotal * 12 * faktorBiaya;
    const biayaOperasionalTahunan = biayaOperasional * 12 * faktorBiaya;

    const netBenefit =
      pendapatanTahunan - hppTahunan - biayaOperasionalTahunan;

    const discountedBenefit = netBenefit / Math.pow(1 + discountRate, tahun);

    akumulasiCashflow += netBenefit;
    cashflows.push(netBenefit);

    pvBenefit += pendapatanTahunan / Math.pow(1 + discountRate, tahun);

    pvCost +=
      (hppTahunan + biayaOperasionalTahunan) /
      Math.pow(1 + discountRate, tahun);

    cashflowRows.push({
      tahun,
      pendapatanTahunan,
      hppTahunan,
      biayaOperasionalTahunan,
      netBenefit,
      discountedBenefit,
      akumulasiCashflow
    });
  }

  const npv = hitungNPV(cashflows, discountRate);
  const irr = hitungIRR(cashflows);
  const netBC = pvCost > 0 ? pvBenefit / pvCost : 0;

  const roi =
    investasi.totalInvestasi > 0
      ? ((labaBersih * 12) / investasi.totalInvestasi) * 100
      : 0;

  const ppBulan =
    labaBersih > 0 ? investasi.totalInvestasi / labaBersih : Infinity;

  const skor = hitungSkorKelayakan({
    npv,
    irr,
    netBC,
    roi,
    labaBersih,
    ppBulan,
    discountRate
  });

  const status = tentukanStatus({
    npv,
    irr,
    netBC,
    labaBersih,
    discountRate,
    skor
  });

  hasilTerakhir = {
    tanggal: new Date().toISOString(),
    jenisUsaha,
    skenario,
    produksi,
    biayaVariabel,
    biayaTetap,
    investasi,
    biayaTenagaKerja,
    hppTotal,
    hppPerKg,
    labaKotor,
    biayaOperasional,
    labaBersih,
    hargaJualRataRata,
    marginBersih,
    rasioHPP,
    cashflows,
    cashflowRows,
    npv,
    irr,
    netBC,
    roi,
    ppBulan,
    skor,
    status,
    discountRate
  };

  renderDashboard(hasilTerakhir);
  hitungSwitchingValue();

  byId("dashboard").scrollIntoView({ behavior: "smooth" });
}

/* ======================================================
   SKOR DAN STATUS
====================================================== */

function hitungSkorKelayakan(data) {
  let skor = 0;

  if (data.npv > 0) skor += 25;
  if (data.netBC > 1) skor += 20;
  if (data.irr > data.discountRate * 100) skor += 20;
  if (data.roi > 0) skor += 10;
  if (data.labaBersih > 0) skor += 15;
  if (data.ppBulan <= 36) skor += 10;

  return Math.min(100, skor);
}

function tentukanStatus(data) {
  const layak =
    data.npv > 0 &&
    data.netBC > 1 &&
    data.irr > data.discountRate * 100 &&
    data.labaBersih > 0;

  if (layak && data.skor >= 70) return "Layak";
  if (data.labaBersih > 0 || data.skor >= 50) return "Layak Bersyarat";
  return "Tidak Layak";
}

/* ======================================================
   RENDER DASHBOARD
====================================================== */

function renderDashboard(data) {
  renderHero(data);
  renderKPI(data);
  renderBars(data);
  renderLaporan(data);
  renderCashflow(data.cashflowRows);
  renderScore(data);
  renderDonut(data);
}

function renderHero(data) {
  const hero = byId("heroKelayakan");
  const icon = byId("heroIcon");

  if (data.status === "Layak") {
    hero.className = "hero-card hero-layak";
    icon.innerText = "✓";

    setText("heroTitle", "LAYAK");
    setText("heroSubtitle", "Usaha direkomendasikan untuk dijalankan");
    setText(
      "heroDescription",
      `NPV ${rupiah(data.npv)}, IRR ${persen(data.irr)}, Net B/C ${desimal(data.netBC)}, PP ${formatPP(data.ppBulan)}.`
    );
  } 
  
  else if (data.status === "Layak Bersyarat") {
    hero.className = "hero-card hero-cukup";
    icon.innerText = "!";

    setText("heroTitle", "LAYAK BERSYARAT");
    setText("heroSubtitle", "Usaha masih menarik, tetapi perlu perbaikan");
    setText(
      "heroDescription",
      "Perlu efisiensi HPP, penguatan harga jual, peningkatan volume, atau penyesuaian investasi."
    );
  } 
  
  else {
    hero.className = "hero-card hero-tidak";
    icon.innerText = "×";

    setText("heroTitle", "TIDAK LAYAK");
    setText("heroSubtitle", "Usaha belum direkomendasikan");
    setText(
      "heroDescription",
      "Indikator keuangan belum memenuhi batas kelayakan investasi."
    );
  }

  const kesimpulan = byId("kesimpulanKelayakan");
  kesimpulan.className = "conclusion-box";

  if (data.status === "Layak") {
    kesimpulan.classList.add("conclusion-layak");
    kesimpulan.innerHTML =
      `<strong>Kesimpulan:</strong> Usaha ini layak secara finansial dengan tingkat pengembalian tinggi dan risiko investasi relatif rendah.`;
  } 
  
  else if (data.status === "Layak Bersyarat") {
    kesimpulan.classList.add("conclusion-warning");
    kesimpulan.innerHTML =
      `<strong>Kesimpulan:</strong> Usaha ini layak bersyarat. Perlu optimasi HPP, biaya operasional, volume produksi, atau investasi.`;
  } 
  
  else {
    kesimpulan.classList.add("conclusion-tidak");
    kesimpulan.innerHTML =
      `<strong>Kesimpulan:</strong> Usaha belum layak untuk ditawarkan kepada investor tanpa perbaikan struktur usaha.`;
  }
}

function renderScore(data) {
  setText("hasilSkor", `${data.skor}/100`);
  setText("labelSkor", data.status);

  const fill = byId("scoreFill");

  if (fill) {
    fill.style.width = `${data.skor}%`;

    fill.className = "score-fill";

    if (data.status === "Layak") fill.classList.add("score-good");
    else if (data.status === "Layak Bersyarat") fill.classList.add("score-warning");
    else fill.classList.add("score-bad");
  }
}

function renderKPI(data) {
  const totalBiayaUsaha = data.hppTotal + data.biayaOperasional;

  setHTML("hasilNPV", rupiahHTML(data.npv));
  setText("hasilIRR", persen(data.irr));
  setText("hasilNetBC", desimal(data.netBC));
  setText("hasilPP", formatPP(data.ppBulan));
  setText("hasilROI", persen(data.roi));
  setHTML("hasilHPP", rupiahPerKgHTML(data.hppPerKg));
  setHTML("hasilLabaBersih", rupiahHTML(data.labaBersih));
  setText("hasilMarginBersih", persen(data.marginBersih));
  setText("hasilRasioHPP", persen(data.rasioHPP));
  setText("hasilProduk", formatKg(data.produksi.produkJadiBulanan));
  setText("hasilBahanBaku", formatKg(data.produksi.bahanBakuBulanan));
  setHTML("hasilPendapatan", rupiahHTML(data.produksi.pendapatanBulanan));

  setHTML("quickNPV", rupiahHTML(data.npv));
  setText("quickIRR", persen(data.irr));
  setText("quickNetBC", desimal(data.netBC));
  setText("quickPP", formatPP(data.ppBulan));

  setHTML("dashBiayaBahanBaku", rupiahHTML(data.produksi.biayaBahanBakuBulanan));
  setHTML("dashBiayaVariabel", rupiahHTML(data.biayaVariabel.total));
  setHTML("dashBiayaTenagaKerja", rupiahHTML(data.biayaTenagaKerja));
  setHTML("dashBiayaTetap", rupiahHTML(data.biayaTetap.total));
  setHTML("dashTotalBiaya", rupiahHTML(totalBiayaUsaha));

  const pct = (nilai) => totalBiayaUsaha > 0 ? (nilai / totalBiayaUsaha) * 100 : 0;
  setText("dashPctBahanBaku", persenSatuDigit(pct(data.produksi.biayaBahanBakuBulanan)));
  setText("dashPctVariabel", persenSatuDigit(pct(data.biayaVariabel.total)));
  setText("dashPctTenagaKerja", persenSatuDigit(pct(data.biayaTenagaKerja)));
  setText("dashPctTetap", persenSatuDigit(pct(data.biayaTetap.total)));
}

function renderBars(data) {
  const max = Math.max(
    data.produksi.pendapatanBulanan,
    data.hppTotal,
    data.biayaOperasional,
    Math.abs(data.labaBersih),
    1
  );

  byId("barPendapatan").style.width = `${(data.produksi.pendapatanBulanan / max) * 100}%`;
  byId("barHPP").style.width = `${(data.hppTotal / max) * 100}%`;
  byId("barOPEX").style.width = `${(data.biayaOperasional / max) * 100}%`;
  byId("barLaba").style.width = `${(Math.abs(data.labaBersih) / max) * 100}%`;

  setHTML("labelPendapatan", rupiahHTML(data.produksi.pendapatanBulanan));
  setHTML("labelHPP", rupiahHTML(data.hppTotal));
  setHTML("labelOPEX", rupiahHTML(data.biayaOperasional));
  setHTML("labelLaba", rupiahHTML(data.labaBersih));

  const insight = byId("marginInsight");
  if (insight) {
    insight.innerHTML =
      `↗ Margin bersih sebesar <strong>${persen(data.marginBersih)}</strong> menunjukkan ${
        data.marginBersih >= 10
          ? "profitabilitas usaha yang sehat."
          : "profitabilitas masih perlu ditingkatkan."
      }`;
  }
}

function renderDonut(data) {
  const total = data.hppTotal + data.biayaOperasional;
  const segments = [
    { label: "Bahan baku", nilai: data.produksi.biayaBahanBakuBulanan, color: "#0f766e" },
    { label: "Variabel", nilai: data.biayaVariabel.total, color: "#fb923c" },
    { label: "Tenaga kerja", nilai: data.biayaTenagaKerja, color: "#8b5cf6" },
    { label: "Tetap", nilai: data.biayaTetap.total, color: "#38bdf8" }
  ];

  const terbesar = segments.reduce((max, item) => item.nilai > max.nilai ? item : max, segments[0]);
  const porsiTerbesar = total > 0 ? (terbesar.nilai / total) * 100 : 0;

  setText("donutLabel", total > 0 ? persenSatuDigit(porsiTerbesar) : "-");
  setText("donutCaption", total > 0 ? terbesar.label : "Porsi terbesar");

  const donut = byId("costDonut");
  if (donut) {
    if (total <= 0) {
      donut.style.background = "conic-gradient(#e2e8f0 0deg 360deg)";
      return;
    }

    let cursor = 0;
    const gradient = segments.map((item) => {
      const start = cursor;
      const degree = (item.nilai / total) * 360;
      cursor += degree;
      return `${item.color} ${start}deg ${cursor}deg`;
    }).join(", ");

    donut.style.background = `conic-gradient(${gradient})`;
  }
}

/* ======================================================
   LAPORAN
====================================================== */

function renderLaporan(data) {
  setText(
    "ringkasanOtomatis",
    `Usaha ${namaJenisUsaha(data.jenisUsaha)} menghasilkan pendapatan bulanan ${rupiah(data.produksi.pendapatanBulanan)} dengan total biaya ${rupiah(data.hppTotal + data.biayaOperasional)} dan laba bersih ${rupiah(data.labaBersih)}. Investasi awal ${rupiah(data.investasi.totalInvestasi)} dengan proyeksi ${getNumber("periodeProyeksi")} tahun menghasilkan NPV ${rupiah(data.npv)}, IRR ${persen(data.irr)}, Net B/C ${desimal(data.netBC)}, ROI ${persen(data.roi)}, dan Payback Period ${formatPP(data.ppBulan)}. Kesimpulan sistem: ${data.status.toUpperCase()}.`
  );

  const box = byId("rekomendasiBox");
  box.className = "recommendation-section";

  if (data.status === "Layak") {
    box.classList.add("recommendation-good");
    setText(
      "rekomendasiSistem",
      "Direkomendasikan untuk dijalankan. Usaha menunjukkan struktur finansial yang menarik bagi investor."
    );
  } else if (data.status === "Layak Bersyarat") {
    box.classList.add("recommendation-warning");
    setText(
      "rekomendasiSistem",
      "Direkomendasikan dengan catatan. Perlu efisiensi biaya, penguatan pasar, atau penyesuaian investasi."
    );
  } else {
    box.classList.add("recommendation-bad");
    setText(
      "rekomendasiSistem",
      "Belum direkomendasikan. Perlu perbaikan model usaha sebelum ditawarkan kepada investor."
    );
  }

  const risiko = [];

  if (data.labaBersih <= 0) risiko.push("Laba bersih masih negatif.");
  if (data.rasioHPP > 75) risiko.push("Rasio HPP cukup tinggi terhadap harga jual.");
  if (data.marginBersih > 0 && data.marginBersih < 10) risiko.push("Margin laba bersih masih di bawah 10%.");
  if (data.netBC <= 1) risiko.push("Net B/C belum lebih dari 1.");
  if (data.irr <= data.discountRate * 100) risiko.push("IRR masih di bawah discount rate.");
  if (data.ppBulan > 36) risiko.push("Payback Period lebih dari 3 tahun.");

  if (risiko.length === 0) {
    risiko.push("Tidak ada risiko besar yang terdeteksi dari simulasi awal.");
  }

  byId("catatanRisiko").innerHTML = risiko.map((item) => `<li>${item}</li>`).join("");

  setText("detailPendapatan", rupiah(data.produksi.pendapatanBulanan));
  setText("detailBiayaBahanBaku", rupiah(data.produksi.biayaBahanBakuBulanan));
  setText("detailBiayaVariabel", rupiah(data.biayaVariabel.total));
  setText("detailHPPTotal", rupiah(data.hppTotal));
  setText("detailLabaKotor", rupiah(data.labaKotor));
  setText("detailBiayaTenagaKerja", rupiah(data.biayaTenagaKerja));
  setText("detailBiayaTetap", rupiah(data.biayaTetap.total));
  setText("detailTotalOPEX", rupiah(data.biayaOperasional));
  setText("detailLabaBersih", rupiah(data.labaBersih));
}

function renderCashflow(rows) {
  const tbody = byId("cashflowBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const positif = row.netBenefit >= 0;

    tr.innerHTML = `
      <td><span class="year-pill">Tahun ${row.tahun}</span></td>
      <td class="num-cell">${rupiah(row.pendapatanTahunan)}</td>
      <td class="num-cell">${rupiah(row.hppTahunan)}</td>
      <td class="num-cell">${rupiah(row.biayaOperasionalTahunan)}</td>
      <td class="num-cell ${positif ? "good-text" : "bad-text"}">${rupiah(row.netBenefit)}</td>
      <td class="num-cell">${rupiah(row.discountedBenefit)}</td>
      <td class="num-cell strong-cell">${rupiah(row.akumulasiCashflow)}</td>
    `;

    tbody.appendChild(tr);
  });
}

/* ======================================================
   SWITCHING VALUE
====================================================== */

function hitungSwitchingValue() {
  if (!hasilTerakhir) {
    setSwitchingKosong();
    return;
  }

  const d = hasilTerakhir;
  const ruangLaba = d.labaBersih;

  const hargaJualSaatIni = d.hargaJualRataRata;
  const hargaBeliSaatIni = d.produksi.hargaBeliRataRata;
  const produksiSaatIni = d.produksi.produkJadiBulanan;
  const operasionalSaatIni = d.biayaOperasional;

  let hargaTurun =
    d.produksi.pendapatanBulanan > 0
      ? (ruangLaba / d.produksi.pendapatanBulanan) * 100
      : 0;

  let bahanBakuNaik =
    d.produksi.biayaBahanBakuBulanan > 0
      ? (ruangLaba / d.produksi.biayaBahanBakuBulanan) * 100
      : 0;

  let produksiTurun =
    d.produksi.pendapatanBulanan > 0
      ? (ruangLaba / d.produksi.pendapatanBulanan) * 100
      : 0;

  let operasionalNaik =
    d.biayaOperasional > 0
      ? (ruangLaba / d.biayaOperasional) * 100
      : 0;

  hargaTurun = Math.max(0, hargaTurun);
  bahanBakuNaik = Math.max(0, bahanBakuNaik);
  produksiTurun = Math.max(0, produksiTurun);
  operasionalNaik = Math.max(0, operasionalNaik);

  const hargaJualMin = hargaJualSaatIni * (1 - hargaTurun / 100);
  const hargaBeliMax = hargaBeliSaatIni * (1 + bahanBakuNaik / 100);
  const produksiMin = produksiSaatIni * (1 - produksiTurun / 100);
  const operasionalMax = operasionalSaatIni * (1 + operasionalNaik / 100);

  updateSwitchText("switchHarga", persen(hargaTurun));
  updateSwitchText("switchBahanBaku", persen(bahanBakuNaik));
  updateSwitchText("switchProduksi", persen(produksiTurun));
  updateSwitchText("switchOperasional", persen(operasionalNaik));

  updateSwitchText("switchHargaDetail", persen(hargaTurun));
  updateSwitchText("switchBahanBakuDetail", persen(bahanBakuNaik));
  updateSwitchText("switchProduksiDetail", persen(produksiTurun));
  updateSwitchText("switchOperasionalDetail", persen(operasionalNaik));

  updateSwitchText("switchHargaValue", rupiahPerKg(hargaJualMin));
  updateSwitchText("switchBahanBakuValue", rupiahPerKg(hargaBeliMax));
  updateSwitchText("switchProduksiValue", formatKg(produksiMin) + " / bulan");
  updateSwitchText("switchOperasionalValue", rupiah(operasionalMax) + " / bulan");

  updateSwitchText("switchHargaValueDetail", rupiahPerKg(hargaJualMin));
  updateSwitchText("switchBahanBakuValueDetail", rupiahPerKg(hargaBeliMax));
  updateSwitchText("switchProduksiValueDetail", formatKg(produksiMin) + " / bulan");
  updateSwitchText("switchOperasionalValueDetail", rupiah(operasionalMax) + " / bulan");
}

function updateSwitchText(id, value) {
  const el = byId(id);
  if (el) el.innerText = value;
}

function setSwitchingKosong() {
  [
    "switchHarga",
    "switchBahanBaku",
    "switchProduksi",
    "switchOperasional",
    "switchHargaDetail",
    "switchBahanBakuDetail",
    "switchProduksiDetail",
    "switchOperasionalDetail",
    "switchHargaValue",
    "switchBahanBakuValue",
    "switchProduksiValue",
    "switchOperasionalValue",
    "switchHargaValueDetail",
    "switchBahanBakuValueDetail",
    "switchProduksiValueDetail",
    "switchOperasionalValueDetail"
  ].forEach((id) => updateSwitchText(id, "-"));
}

/* ======================================================
   EXPORT / SAVE / RESET
====================================================== */

function formatTanggalID(value) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function buildRiskList(data) {
  const risiko = [];

  if (data.labaBersih <= 0) risiko.push("Laba bersih masih negatif.");
  if (data.rasioHPP > 75) risiko.push("Rasio HPP cukup tinggi terhadap harga jual.");
  if (data.marginBersih > 0 && data.marginBersih < 10) risiko.push("Margin laba bersih masih di bawah 10%.");
  if (data.netBC <= 1) risiko.push("Net B/C belum lebih dari 1.");
  if (data.irr <= data.discountRate * 100) risiko.push("IRR masih di bawah discount rate.");
  if (data.ppBulan > 36) risiko.push("Payback Period lebih dari 3 tahun.");

  if (risiko.length === 0) risiko.push("Tidak ada risiko besar yang terdeteksi dari simulasi awal.");
  return risiko;
}

function rekomendasiText(data) {
  if (data.status === "Layak") {
    return "Direkomendasikan untuk dijalankan. Usaha menunjukkan struktur finansial yang menarik bagi investor.";
  }

  if (data.status === "Layak Bersyarat") {
    return "Direkomendasikan dengan catatan. Perlu efisiensi biaya, penguatan pasar, atau penyesuaian investasi.";
  }

  return "Belum direkomendasikan. Perlu perbaikan model usaha sebelum ditawarkan kepada investor.";
}

function buildPrintableReport(d) {
  const totalBiayaUsaha = d.hppTotal + d.biayaOperasional;
  const pct = (nilai) => totalBiayaUsaha > 0 ? (nilai / totalBiayaUsaha) * 100 : 0;
  const statusClass = d.status === "Layak" ? "good" : d.status === "Layak Bersyarat" ? "warn" : "bad";
  const risikoItems = buildRiskList(d).map((item) => `<li>${escapeHTML(item)}</li>`).join("");

  const cashflowRows = d.cashflowRows.map((row) => `
    <tr>
      <td>Tahun ${row.tahun}</td>
      <td>${rupiah(row.pendapatanTahunan)}</td>
      <td>${rupiah(row.hppTahunan)}</td>
      <td>${rupiah(row.biayaOperasionalTahunan)}</td>
      <td class="${row.netBenefit >= 0 ? "positive" : "negative"}">${rupiah(row.netBenefit)}</td>
      <td>${rupiah(row.discountedBenefit)}</td>
      <td>${rupiah(row.akumulasiCashflow)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>Laporan Kelayakan KNMP/KDKMP</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #ffffff; font-size: 10.8px; }
  .report { width: 100%; }
  .cover { display: grid; grid-template-columns: 1fr 165px; gap: 18px; padding: 18px; border-radius: 18px; color: #fff; background: linear-gradient(135deg, #063f46, #0f766e 55%, #0891b2); }
  .badge { display: inline-block; margin-bottom: 9px; padding: 5px 10px; border-radius: 999px; background: rgba(255,255,255,.18); font-size: 9px; font-weight: 800; letter-spacing: .12em; }
  h1 { margin: 0 0 7px; font-size: 22px; line-height: 1.1; letter-spacing: -.02em; }
  h2 { margin: 0 0 9px; font-size: 13px; color: #0f172a; }
  p { margin: 0; line-height: 1.5; }
  .meta { color: rgba(255,255,255,.88); }
  .status-card { padding: 13px; border-radius: 15px; background: rgba(255,255,255,.15); text-align: center; }
  .status-card span { display: block; font-size: 9.5px; opacity: .9; }
  .status-card strong { display: block; margin: 5px 0; font-size: 20px; }
  .score-track { height: 8px; margin-top: 9px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.25); }
  .score-fill { width: ${Math.max(0, Math.min(100, d.skor))}%; height: 100%; background: #ffffff; border-radius: 999px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
  .kpi { min-height: 58px; padding: 10px; border: 1px solid #dbe7f2; border-radius: 12px; background: #f8fbff; break-inside: avoid; }
  .kpi small { display: block; margin-bottom: 5px; color: #64748b; font-weight: 800; }
  .kpi strong { display: block; color: #0f172a; font-size: 14px; line-height: 1.15; }
  .section { margin-top: 10px; padding: 12px; border: 1px solid #dbe7f2; border-radius: 14px; background: #fff; break-inside: avoid; }
  .summary { display: grid; grid-template-columns: 1fr 230px; gap: 12px; border-color: #bbf7d0; background: #ecfdf5; color: #14532d; }
  .pill-box { display: grid; gap: 6px; }
  .pill { display: flex; justify-content: space-between; gap: 12px; padding: 7px 9px; border-radius: 10px; background: #ffffff; border: 1px solid rgba(22,101,52,.14); }
  .two-col { display: grid; grid-template-columns: 1.05fr .95fr; gap: 10px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { background: #0f766e; color: #fff; font-size: 9.2px; text-align: left; }
  th, td { padding: 6px 7px; border: 1px solid #e2e8f0; vertical-align: middle; }
  td { font-size: 10px; }
  tr:nth-child(even) td { background: #f8fafc; }
  .pl td:first-child, .cost td:first-child { font-weight: 700; color: #334155; }
  .pl td:last-child, .cost td:nth-child(n+2), .cashflow td:nth-child(n+2), .cashflow th:nth-child(n+2) { text-align: right; }
  .total-row td { background: #ecfdf5 !important; font-weight: 800; color: #064e3b; }
  .positive { color: #166534; font-weight: 800; }
  .negative { color: #b91c1c; font-weight: 800; }
  ul { margin: 0; padding-left: 16px; }
  li { margin-bottom: 5px; }
  .footer { margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 9px; display: flex; justify-content: space-between; }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .section, .kpi { break-inside: avoid; } }
</style>
</head>
<body>
  <div class="report">
    <div class="cover">
      <div>
        <div class="badge">KNMP / KDKMP INVESTOR FEASIBILITY DASHBOARD</div>
        <h1>Laporan Analisis Kelayakan Usaha Perikanan</h1>
        <p class="meta">${escapeHTML(namaJenisUsaha(d.jenisUsaha))} · Skenario ${escapeHTML(d.skenario.nama)} · ${formatTanggalID(d.tanggal)}</p>
      </div>
      <div class="status-card ${statusClass}">
        <span>Status Kelayakan</span>
        <strong>${escapeHTML(d.status)}</strong>
        <span>Skor Investor ${d.skor}/100</span>
        <div class="score-track"><div class="score-fill"></div></div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><small>NPV</small><strong>${rupiah(d.npv)}</strong></div>
      <div class="kpi"><small>IRR</small><strong>${persen(d.irr)}</strong></div>
      <div class="kpi"><small>Net B/C</small><strong>${desimal(d.netBC)}</strong></div>
      <div class="kpi"><small>Payback Period</small><strong>${formatPP(d.ppBulan)}</strong></div>
      <div class="kpi"><small>ROI</small><strong>${persen(d.roi)}</strong></div>
      <div class="kpi"><small>HPP / Kg</small><strong>${rupiahPerKg(d.hppPerKg)}</strong></div>
      <div class="kpi"><small>Laba Bersih / Bulan</small><strong>${rupiah(d.labaBersih)}</strong></div>
      <div class="kpi"><small>Margin Bersih</small><strong>${persen(d.marginBersih)}</strong></div>
    </div>

    <div class="section summary">
      <div>
        <h2>Executive Summary</h2>
        <p>Usaha ${escapeHTML(namaJenisUsaha(d.jenisUsaha))} menghasilkan pendapatan bulanan ${rupiah(d.produksi.pendapatanBulanan)} dengan total biaya usaha ${rupiah(totalBiayaUsaha)} dan laba bersih ${rupiah(d.labaBersih)}. Investasi awal ${rupiah(d.investasi.totalInvestasi)} menghasilkan NPV ${rupiah(d.npv)}, IRR ${persen(d.irr)}, Net B/C ${desimal(d.netBC)}, ROI ${persen(d.roi)}, dan Payback Period ${formatPP(d.ppBulan)}.</p>
      </div>
      <div class="pill-box">
        <div class="pill"><span>Produksi / Bulan</span><strong>${formatKg(d.produksi.produkJadiBulanan)}</strong></div>
        <div class="pill"><span>Bahan Baku / Bulan</span><strong>${formatKg(d.produksi.bahanBakuBulanan)}</strong></div>
        <div class="pill"><span>Investasi Awal</span><strong>${rupiah(d.investasi.totalInvestasi)}</strong></div>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <h2>Struktur Laba Rugi Bulanan</h2>
        <table class="pl">
          <tr><td>Pendapatan</td><td>${rupiah(d.produksi.pendapatanBulanan)}</td></tr>
          <tr><td>Biaya bahan baku</td><td>${rupiah(d.produksi.biayaBahanBakuBulanan)}</td></tr>
          <tr><td>Biaya produksi variabel</td><td>${rupiah(d.biayaVariabel.total)}</td></tr>
          <tr class="total-row"><td>HPP total</td><td>${rupiah(d.hppTotal)}</td></tr>
          <tr><td>Laba kotor</td><td>${rupiah(d.labaKotor)}</td></tr>
          <tr><td>Biaya tenaga kerja</td><td>${rupiah(d.biayaTenagaKerja)}</td></tr>
          <tr><td>Biaya operasional tetap</td><td>${rupiah(d.biayaTetap.total)}</td></tr>
          <tr class="total-row"><td>Total biaya operasional</td><td>${rupiah(d.biayaOperasional)}</td></tr>
          <tr class="total-row"><td>Laba bersih</td><td>${rupiah(d.labaBersih)}</td></tr>
        </table>
      </div>
      <div class="section">
        <h2>Komposisi Biaya Usaha</h2>
        <table class="cost">
          <tr><th>Komponen</th><th>Nilai</th><th>Porsi</th></tr>
          <tr><td>Bahan baku</td><td>${rupiah(d.produksi.biayaBahanBakuBulanan)}</td><td>${persenSatuDigit(pct(d.produksi.biayaBahanBakuBulanan))}</td></tr>
          <tr><td>Biaya variabel</td><td>${rupiah(d.biayaVariabel.total)}</td><td>${persenSatuDigit(pct(d.biayaVariabel.total))}</td></tr>
          <tr><td>Tenaga kerja</td><td>${rupiah(d.biayaTenagaKerja)}</td><td>${persenSatuDigit(pct(d.biayaTenagaKerja))}</td></tr>
          <tr><td>Operasional tetap</td><td>${rupiah(d.biayaTetap.total)}</td><td>${persenSatuDigit(pct(d.biayaTetap.total))}</td></tr>
          <tr class="total-row"><td>Total</td><td>${rupiah(totalBiayaUsaha)}</td><td>100,0%</td></tr>
        </table>
      </div>
    </div>

    <div class="two-col">
      <div class="section">
        <h2>Rekomendasi Sistem</h2>
        <p>${escapeHTML(rekomendasiText(d))}</p>
      </div>
      <div class="section">
        <h2>Catatan Risiko</h2>
        <ul>${risikoItems}</ul>
      </div>
    </div>

    <div class="section">
      <h2>Proyeksi Cashflow</h2>
      <table class="cashflow">
        <thead>
          <tr>
            <th style="width:12%">Tahun</th><th>Pendapatan</th><th>HPP</th><th>OPEX</th><th>Net Benefit</th><th>Discounted</th><th>Akumulasi</th>
          </tr>
        </thead>
        <tbody>${cashflowRows}</tbody>
      </table>
    </div>

    <div class="footer">
      <span>KNMP / KDKMP Investor Feasibility Dashboard</span>
      <span>Dokumen ini dihasilkan otomatis berdasarkan input pengguna.</span>
    </div>
  </div>
</body>
</html>`;
}

function buildExcelWorkbook(d) {
  const totalBiayaUsaha = d.hppTotal + d.biayaOperasional;
  const pct = (nilai) => totalBiayaUsaha > 0 ? nilai / totalBiayaUsaha : 0;
  const risk = buildRiskList(d);
  const statusStyle = d.status === "Layak" ? "Good" : d.status === "Layak Bersyarat" ? "Warn" : "Bad";
  const xml = (value) => escapeHTML(value).replace(/\r?\n/g, " ");
  const row = (cells) => `<Row>${cells.join("")}</Row>`;
  const textCell = (value, style = "Text") => `<Cell ss:StyleID="${style}"><Data ss:Type="String">${xml(value)}</Data></Cell>`;
  const numCell = (value, style = "Number") => `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${Number(value || 0)}</Data></Cell>`;
  const pctCell = (value, style = "Percent") => `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${Number(value || 0)}</Data></Cell>`;

  const sheetStart = (name, cols = 7) => `
    <Worksheet ss:Name="${xml(name)}">
      <Table ss:ExpandedColumnCount="7">
        <Column ss:AutoFitWidth="0" ss:Width="170"/>
        <Column ss:AutoFitWidth="0" ss:Width="135"/>
        <Column ss:AutoFitWidth="0" ss:Width="150"/>
        <Column ss:AutoFitWidth="0" ss:Width="135"/>
        <Column ss:AutoFitWidth="0" ss:Width="150"/>
        <Column ss:AutoFitWidth="0" ss:Width="135"/>
        <Column ss:AutoFitWidth="0" ss:Width="140"/>`;
  const sheetEnd = `</Table></Worksheet>`;

  const summaryRows = [
    `<Row ss:Height="30"><Cell ss:MergeAcross="5" ss:StyleID="Title"><Data ss:Type="String">Laporan Analisis Kelayakan KNMP/KDKMP</Data></Cell></Row>`,
    `<Row><Cell ss:MergeAcross="5" ss:StyleID="Subtitle"><Data ss:Type="String">${xml(namaJenisUsaha(d.jenisUsaha))} · Skenario ${xml(d.skenario.nama)} · ${xml(formatTanggalID(d.tanggal))}</Data></Cell></Row>`,
    row([textCell("Status", "Label"), textCell(d.status, statusStyle), textCell("Skor Investor", "Label"), numCell(d.skor, "NumberBold"), textCell("Periode Proyeksi", "Label"), textCell(`${getNumber("periodeProyeksi")} tahun`, "Text")]),
    row([textCell("Indikator", "Header"), textCell("Nilai", "Header"), textCell("Indikator", "Header"), textCell("Nilai", "Header"), textCell("Indikator", "Header"), textCell("Nilai", "Header")]),
    row([textCell("NPV", "Label"), numCell(d.npv, "Currency"), textCell("IRR", "Label"), pctCell(d.irr / 100), textCell("Net B/C", "Label"), numCell(d.netBC, "Decimal")]),
    row([textCell("Payback Period", "Label"), textCell(formatPP(d.ppBulan), "Text"), textCell("ROI", "Label"), pctCell(d.roi / 100), textCell("HPP / Kg", "Label"), numCell(d.hppPerKg, "Currency")]),
    row([textCell("Pendapatan / Bulan", "Label"), numCell(d.produksi.pendapatanBulanan, "Currency"), textCell("Laba Bersih / Bulan", "Label"), numCell(d.labaBersih, "Currency"), textCell("Margin Bersih", "Label"), pctCell(d.marginBersih / 100)]),
    row([textCell("Produksi / Bulan", "Label"), textCell(formatKg(d.produksi.produkJadiBulanan), "Text"), textCell("Bahan Baku / Bulan", "Label"), textCell(formatKg(d.produksi.bahanBakuBulanan), "Text"), textCell("Investasi Awal", "Label"), numCell(d.investasi.totalInvestasi, "Currency")]),
    `<Row ss:Height="28"><Cell ss:MergeAcross="5" ss:StyleID="Section"><Data ss:Type="String">Executive Summary</Data></Cell></Row>`,
    `<Row><Cell ss:MergeAcross="5" ss:StyleID="Wrap"><Data ss:Type="String">${xml(`Usaha ${namaJenisUsaha(d.jenisUsaha)} menghasilkan pendapatan bulanan ${rupiah(d.produksi.pendapatanBulanan)} dengan total biaya usaha ${rupiah(totalBiayaUsaha)} dan laba bersih ${rupiah(d.labaBersih)}. Investasi awal ${rupiah(d.investasi.totalInvestasi)} menghasilkan NPV ${rupiah(d.npv)}, IRR ${persen(d.irr)}, Net B/C ${desimal(d.netBC)}, ROI ${persen(d.roi)}, dan Payback Period ${formatPP(d.ppBulan)}.`)}</Data></Cell></Row>`,
  ].join("");

  const plRows = [
    `<Row ss:Height="28"><Cell ss:MergeAcross="2" ss:StyleID="Title"><Data ss:Type="String">Struktur Laba Rugi Bulanan</Data></Cell></Row>`,
    row([textCell("Komponen", "Header"), textCell("Nilai", "Header"), textCell("Catatan", "Header")]),
    row([textCell("Pendapatan", "Label"), numCell(d.produksi.pendapatanBulanan, "Currency"), textCell("Omzet bulanan", "Text")]),
    row([textCell("Biaya bahan baku", "Label"), numCell(d.produksi.biayaBahanBakuBulanan, "Currency"), textCell("Input utama produksi", "Text")]),
    row([textCell("Biaya produksi variabel", "Label"), numCell(d.biayaVariabel.total, "Currency"), textCell("Kemasan, utilitas produksi, dll.", "Text")]),
    row([textCell("HPP total", "Total"), numCell(d.hppTotal, "CurrencyTotal"), textCell("Bahan baku + variabel", "Total")]),
    row([textCell("Laba kotor", "Label"), numCell(d.labaKotor, "Currency"), textCell("Pendapatan - HPP", "Text")]),
    row([textCell("Biaya tenaga kerja", "Label"), numCell(d.biayaTenagaKerja, "Currency"), textCell("Gaji/upah bulanan", "Text")]),
    row([textCell("Biaya operasional tetap", "Label"), numCell(d.biayaTetap.total, "Currency"), textCell("Sewa, administrasi, transport, dll.", "Text")]),
    row([textCell("Total biaya operasional", "Total"), numCell(d.biayaOperasional, "CurrencyTotal"), textCell("Tenaga kerja + biaya tetap", "Total")]),
    row([textCell("Laba bersih", "Total"), numCell(d.labaBersih, "CurrencyTotal"), textCell("Laba kotor - OPEX", "Total")]),
  ].join("");

  const costRows = [
    `<Row ss:Height="28"><Cell ss:MergeAcross="3" ss:StyleID="Title"><Data ss:Type="String">Komposisi Biaya Usaha Bulanan</Data></Cell></Row>`,
    row([textCell("Komponen", "Header"), textCell("Nilai", "Header"), textCell("Porsi", "Header"), textCell("Kategori", "Header")]),
    row([textCell("Biaya bahan baku", "Label"), numCell(d.produksi.biayaBahanBakuBulanan, "Currency"), pctCell(pct(d.produksi.biayaBahanBakuBulanan)), textCell("HPP", "Text")]),
    row([textCell("Biaya variabel", "Label"), numCell(d.biayaVariabel.total, "Currency"), pctCell(pct(d.biayaVariabel.total)), textCell("HPP", "Text")]),
    row([textCell("Biaya tenaga kerja", "Label"), numCell(d.biayaTenagaKerja, "Currency"), pctCell(pct(d.biayaTenagaKerja)), textCell("OPEX", "Text")]),
    row([textCell("Biaya operasional tetap", "Label"), numCell(d.biayaTetap.total, "Currency"), pctCell(pct(d.biayaTetap.total)), textCell("OPEX", "Text")]),
    row([textCell("Total biaya usaha", "Total"), numCell(totalBiayaUsaha, "CurrencyTotal"), pctCell(1, "PercentTotal"), textCell("Total", "Total")]),
  ].join("");

  const cashflowRows = [
    `<Row ss:Height="28"><Cell ss:MergeAcross="6" ss:StyleID="Title"><Data ss:Type="String">Proyeksi Cashflow</Data></Cell></Row>`,
    row([textCell("Tahun", "Header"), textCell("Pendapatan", "Header"), textCell("HPP", "Header"), textCell("Biaya Operasional", "Header"), textCell("Net Benefit", "Header"), textCell("Discounted Benefit", "Header"), textCell("Akumulasi Cashflow", "Header")]),
    ...d.cashflowRows.map((r) => row([
      textCell(`Tahun ${r.tahun}`, "Label"),
      numCell(r.pendapatanTahunan, "Currency"),
      numCell(r.hppTahunan, "Currency"),
      numCell(r.biayaOperasionalTahunan, "Currency"),
      numCell(r.netBenefit, r.netBenefit >= 0 ? "CurrencyGood" : "CurrencyBad"),
      numCell(r.discountedBenefit, "Currency"),
      numCell(r.akumulasiCashflow, "CurrencyTotal")
    ]))
  ].join("");

  const sw = d.switching || {};
  const switchingRows = [
    `<Row ss:Height="28"><Cell ss:MergeAcross="3" ss:StyleID="Title"><Data ss:Type="String">Switching Value</Data></Cell></Row>`,
    row([textCell("Parameter", "Header"), textCell("Batas Toleransi", "Header"), textCell("Nilai Batas", "Header"), textCell("Makna", "Header")]),
    row([textCell("Harga jual turun", "Label"), pctCell((sw.hargaTurun || 0) / 100), numCell(sw.hargaJualMin || 0, "Currency"), textCell("Harga jual masih aman sampai nilai minimum ini", "Text")]),
    row([textCell("Harga bahan baku naik", "Label"), pctCell((sw.bahanBakuNaik || 0) / 100), numCell(sw.hargaBeliMax || 0, "Currency"), textCell("Bahan baku masih aman sampai harga maksimum ini", "Text")]),
    row([textCell("Produksi turun", "Label"), pctCell((sw.produksiTurun || 0) / 100), numCell(sw.produksiMin || 0, "Number"), textCell("Produksi minimal sebelum laba habis", "Text")]),
    row([textCell("Biaya operasional naik", "Label"), pctCell((sw.operasionalNaik || 0) / 100), numCell(sw.operasionalMax || 0, "Currency"), textCell("OPEX maksimum sebelum laba habis", "Text")]),
  ].join("");

  const riskRows = [
    `<Row ss:Height="28"><Cell ss:MergeAcross="2" ss:StyleID="Title"><Data ss:Type="String">Rekomendasi dan Risiko</Data></Cell></Row>`,
    row([textCell("Rekomendasi Sistem", "Header"), textCell("Catatan Risiko", "Header"), textCell("Tanggal Export", "Header")]),
    ...risk.map((item, idx) => row([
      textCell(idx === 0 ? rekomendasiText(d) : "", "Wrap"),
      textCell(item, "Wrap"),
      textCell(idx === 0 ? formatTanggalID(new Date()) : "", "Text")
    ]))
  ].join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>KNMP/KDKMP Dashboard</Author>
  <Title>Laporan Analisis Kelayakan</Title>
 </DocumentProperties>
 <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
  <WindowHeight>9000</WindowHeight><WindowWidth>18000</WindowWidth><ProtectStructure>False</ProtectStructure><ProtectWindows>False</ProtectWindows>
 </ExcelWorkbook>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="10"/><Interior/><NumberFormat/><Protection/></Style>
  <Style ss:ID="Title"><Font ss:FontName="Arial" ss:Size="16" ss:Bold="1" ss:Color="#0F766E"/><Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BBF7D0"/></Borders></Style>
  <Style ss:ID="Subtitle"><Font ss:FontName="Arial" ss:Size="10" ss:Color="#64748B"/><Alignment ss:Vertical="Center"/></Style>
  <Style ss:ID="Header"><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0F766E" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F766E"/></Borders></Style>
  <Style ss:ID="Section"><Font ss:FontName="Arial" ss:Size="12" ss:Bold="1" ss:Color="#064E3B"/><Interior ss:Color="#CCFBF1" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Text"><Font ss:FontName="Arial" ss:Size="10" ss:Color="#0F172A"/></Style>
  <Style ss:ID="Wrap"><Alignment ss:WrapText="1" ss:Vertical="Top"/><Font ss:FontName="Arial" ss:Size="10" ss:Color="#0F172A"/></Style>
  <Style ss:ID="Label"><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#334155"/><Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Total"><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#064E3B"/><Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Number"><NumberFormat ss:Format="#,##0"/></Style>
  <Style ss:ID="NumberBold"><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1"/><NumberFormat ss:Format="#,##0"/></Style>
  <Style ss:ID="Decimal"><NumberFormat ss:Format="#,##0.00"/></Style>
  <Style ss:ID="Percent"><NumberFormat ss:Format="0.00%"/></Style>
  <Style ss:ID="PercentTotal"><Font ss:Bold="1" ss:Color="#064E3B"/><Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/><NumberFormat ss:Format="0.00%"/></Style>
  <Style ss:ID="Currency"><NumberFormat ss:Format="&quot;Rp&quot; #,##0"/></Style>
  <Style ss:ID="CurrencyTotal"><Font ss:Bold="1" ss:Color="#064E3B"/><Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/><NumberFormat ss:Format="&quot;Rp&quot; #,##0"/></Style>
  <Style ss:ID="CurrencyGood"><Font ss:Bold="1" ss:Color="#166534"/><NumberFormat ss:Format="&quot;Rp&quot; #,##0"/></Style>
  <Style ss:ID="CurrencyBad"><Font ss:Bold="1" ss:Color="#B91C1C"/><NumberFormat ss:Format="&quot;Rp&quot; #,##0"/></Style>
  <Style ss:ID="Good"><Font ss:Bold="1" ss:Color="#166534"/><Interior ss:Color="#DCFCE7" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Warn"><Font ss:Bold="1" ss:Color="#92400E"/><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Bad"><Font ss:Bold="1" ss:Color="#991B1B"/><Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/></Style>
 </Styles>
 ${sheetStart("Ringkasan", 6)}${summaryRows}${sheetEnd}
 ${sheetStart("Laba Rugi", 3)}${plRows}${sheetEnd}
 ${sheetStart("Komposisi Biaya", 4)}${costRows}${sheetEnd}
 ${sheetStart("Cashflow", 7)}${cashflowRows}${sheetEnd}
 ${sheetStart("Switching Value", 4)}${switchingRows}${sheetEnd}
 ${sheetStart("Rekomendasi Risiko", 3)}${riskRows}${sheetEnd}
</Workbook>`;
}

function exportCSV() {
  if (!hasilTerakhir) {
    alert("Hitung kelayakan terlebih dahulu.");
    return;
  }

  const workbook = buildExcelWorkbook(hasilTerakhir);
  const blob = new Blob(["\ufeff", workbook], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `laporan-kelayakan-knmp-kdkmp-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();

  URL.revokeObjectURL(url);
}

function cetakLaporan() {
  if (!hasilTerakhir) {
    alert("Hitung kelayakan terlebih dahulu.");
    return;
  }

  const reportWindow = window.open("", "_blank");

  if (!reportWindow) {
    alert("Popup diblokir browser. Izinkan popup, lalu klik Cetak PDF lagi.");
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(buildPrintableReport(hasilTerakhir));
  reportWindow.document.close();
  reportWindow.focus();

  setTimeout(() => {
    reportWindow.print();
  }, 450);
}

function simpanKeServer() {
  if (!hasilTerakhir) {
    alert("Hitung kelayakan terlebih dahulu.");
    return;
  }

  localStorage.setItem("hasilKelayakanInvestor", JSON.stringify(hasilTerakhir));
  alert("Data berhasil disimpan di browser.");
}

function resetData() {
  const yakin = confirm("Yakin ingin reset data?");
  if (!yakin) return;

  localStorage.removeItem("hasilKelayakanInvestor");
  location.reload();
}

/* ======================================================
   DEMO DATA
====================================================== */

function isiDataDemo() {
  setValue("namaKoperasi", "Koperasi Mina Sejahtera");
  setValue("lokasiUsaha", "Cukanggenteng");
  setValue("provinsiUsaha", "Jawa Barat");
  setValue("kabupatenUsaha", "Kab. Bandung");
  setValue("namaPengisi", "Zidan");
  setValue("tahunAnalisis", "2026");

  setValue("jenisUsaha", "pindang");
  setValue("sumberData", "Data Lapangan KNMP/KDKMP");
  setValue("hariKerja", "25");

  gantiJenisUsaha();

  alert("Data demo berhasil dimuat. Klik Hitung Semua.");
}

/* ======================================================
   INIT
====================================================== */

function initApp() {
  aktifkanFormatRupiah();

  if (window.innerWidth <= 980) {
    document.body.classList.add("sidebar-collapsed");
  }

  const btn = byId("floatingSidebarToggle");
  if (btn) {
    const collapsed = document.body.classList.contains("sidebar-collapsed");
    btn.innerText = collapsed ? "☰" : "‹";
    btn.setAttribute(
      "aria-label",
      collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"
    );
  }

  const user = JSON.parse(localStorage.getItem("knmpInvestorUser") || "null");

  if (user) {
    byId("loginScreen").classList.add("hidden");
    byId("app").classList.remove("hidden");
    setText("userGreeting", `Halo, ${user.nama || "Pengguna"} | ${user.instansi || "-"}`);
  }

  document.addEventListener("input", function (event) {
    if (
      event.target.classList.contains("investasi-nilai") ||
      event.target.classList.contains("investasi-umur")
    ) {
      setTimeout(hitungTotalInvestasiPreview, 100);
    }
  });

  document.querySelectorAll(".menu-link").forEach((link) => {
    link.addEventListener("click", function () {
      document.querySelectorAll(".menu-link").forEach((item) => {
        item.classList.remove("active");
      });

      this.classList.add("active");
    });
  });

  gantiJenisUsaha();
  hitungTotalInvestasiPreview();
  setSwitchingKosong();
}

document.addEventListener("DOMContentLoaded", initApp);