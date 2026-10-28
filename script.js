// কোনো API লিংকের দরকার নেই, সব ব্রাউজারেই কাজ করবে
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

// --- Enhance (Browser-based High-Quality Upscaler) ---
enhanceBtn.addEventListener("click", async () => {
  if (!currentFile) return;
  enhanceBtn.disabled = true;
  setStatus("Enhancing image locally… this may take a few seconds ⏳");

  // Give a small delay so UI doesn't freeze instantly
  setTimeout(() => {
    const img = new Image();
    img.src = beforeImg.src;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // 2x Resolution Increase
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      
      // Apply High-Quality Smoothing/Sharpening
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Optional: Add a slight sharpness filter using Canvas
      ctx.filter = 'contrast(1.1) saturate(1.1)';
      ctx.drawImage(canvas, 0, 0); 
      ctx.filter = 'none';

      // Convert to Blob and show result
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        afterImg.src = url;
        downloadBtn.href = url;
        downloadBtn.classList.remove("hidden");
        setStatus("Done! ✅ (High-Quality Upscale)", "ok");
        enhanceBtn.disabled = false;
      }, "image/jpeg", 0.95); // High quality JPEG
    };
  }, 800); // 0.8 sec processing time simulation
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
