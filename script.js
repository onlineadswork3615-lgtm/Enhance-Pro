// ⚠️ এখানে আপনার Cloudflare Worker URL বসাবেন
const ENHANCE_API = "https://YOUR-WORKER.workers.dev/enhance";

const dropzone   = document.getElementById("dropzone");
const fileInput  = document.getElementById("fileInput");
const previewArea= document.getElementById("previewArea");
const beforeImg  = document.getElementById("beforeImg");
const afterImg   = document.getElementById("afterImg");
const enhanceBtn = document.getElementById("enhanceBtn");
const downloadBtn= document.getElementById("downloadBtn");
const resetBtn   = document.getElementById("resetBtn");
const statusEl   = document.getElementById("status");

let currentFile = null;

document.getElementById("year").textContent = new Date().getFullYear();

// --- Upload interactions ---
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("drag"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag"));
dropzone.addEventListener("drop", e => {
  e.preventDefault(); dropzone.classList.remove("drag");
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) return setStatus("Please select an image file.", "error");
  if (file.size > 10 * 1024 * 1024) return setStatus("Image must be under 10 MB.", "error");

  currentFile = file;
  beforeImg.src = URL.createObjectURL(file);
  afterImg.src = "";
  downloadBtn.classList.add("hidden");
  dropzone.classList.add("hidden");
  previewArea.classList.remove("hidden");
  setStatus("");
}

// --- Enhance ---
enhanceBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  enhanceBtn.disabled = true;
  setStatus("Enhancing… this may take a few seconds ⏳");

  try {
    const form = new FormData();
    form.append("image", currentFile);

    const res = await fetch(ENHANCE_API, { method: "POST", body: form });
    if (!res.ok) throw new Error("Server error: " + res.status);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    afterImg.src = url;
    downloadBtn.href = url;
    downloadBtn.classList.remove("hidden");
    setStatus("Done! ✅", "ok");
  } catch (err) {
    console.error(err);
    setStatus("Enhance failed: " + err.message, "error");
  } finally {
    enhanceBtn.disabled = false;
  }
});

// --- Reset ---
resetBtn.addEventListener("click", () => {
  currentFile = null;
  fileInput.value = "";
  previewArea.classList.add("hidden");
  dropzone.classList.remove("hidden");
  beforeImg.src = ""; afterImg.src = "";
  setStatus("");
});

function setStatus(msg, type = "") {
  statusEl.textContent = msg;
  statusEl.className = "status " + type;
}
