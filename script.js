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

// --- Enhance using Browser AI (No Server Needed) ---
enhanceBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  enhanceBtn.disabled = true;
  setStatus("Loading AI Model... Please wait 10-15 seconds ⏳");

  try {
    // Create an image element from the uploaded file
    const img = new Image();
    img.src = beforeImg.src;
    await new Promise((resolve) => img.onload = resolve);

    // Use the UpscalerJS library to enhance the image in the browser
    const upscaler = new Upscaler();
    
    setStatus("Enhancing in browser… (Don't close this tab) ⏳");

    const enhancedSrc = await upscaler.upscale(img.src, {
      output: 'base64',
      patchSize: 64,
      padding: 2,
    });

    afterImg.src = enhancedSrc;
    downloadBtn.href = enhancedSrc;
    downloadBtn.classList.remove("hidden");
    setStatus("Done! ✅ Browser AI Enhance Complete", "ok");

  } catch (err) {
    console.error(err);
    setStatus("Failed: " + err.message, "error");
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
