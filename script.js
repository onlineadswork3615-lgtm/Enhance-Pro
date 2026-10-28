const dropzone   = document.getElementById("dropzone");
const fileInput  = document.getElementById("fileInput");
const previewArea= document.getElementById("previewArea");
const beforeImg  = document.getElementById("beforeImg");
const afterImg   = document.getElementById("afterImg");
const enhanceBtn = document.getElementById("enhanceBtn");
const downloadBtn= document.getElementById("downloadBtn");
const resetBtn   = document.getElementById("resetBtn");
const statusEl   = document.getElementById("status");
const themeToggle= document.getElementById("themeToggle");

let currentFile = null;

// সেটআপ ডার্ক/লাইট থিম
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
});

document.getElementById("year").textContent = new Date().getFullYear();

// আপলোড ইন্টারঅ্যাকশন
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

// এনহ্যান্স ফাংশন (UpscalerJS)
enhanceBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  enhanceBtn.disabled = true;
  
  try {
    setStatus("Loading AI Model... Please wait 10-15s ⏳");

    // ইমেজ তৈরি করা
    const img = new Image();
    img.src = beforeImg.src;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    setStatus("Enhancing image locally (Don't close this tab)… ⏳");

    // ব্রাউজারে AI রান করা
    const upscaler = new Upscaler();
    const enhancedSrc = await upscaler.upscale(img.src, {
      output: 'base64',
      patchSize: 64,
      padding: 2,
    });

    afterImg.src = enhancedSrc;
    downloadBtn.href = enhancedSrc;
    downloadBtn.classList.remove("hidden");
    setStatus("Done! ✅ High-Quality Enhance Complete", "ok");

  } catch (err) {
    console.error(err);
    setStatus("Failed to enhance. Please try a different image.", "error");
  } finally {
    enhanceBtn.disabled = false;
  }
});

// রিসেট
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
