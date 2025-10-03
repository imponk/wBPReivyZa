const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Kontrol
const uploadPhotoLeft = document.getElementById('uploadPhotoLeft');
const uploadPhotoRight = document.getElementById('uploadPhotoRight');

const kutipanLeft = document.getElementById('kutipanLeft');
const namaLeft = document.getElementById('namaLeft');
const jabatanLeft = document.getElementById('jabatanLeft');

const kutipanRight = document.getElementById('kutipanRight');
const namaRight = document.getElementById('namaRight');
const jabatanRight = document.getElementById('jabatanRight');

const zoomLeft = document.getElementById('zoomLeft');
const zoomRight = document.getElementById('zoomRight');

const kreditInput = document.getElementById('kreditInput');
const kreditColorInput = document.getElementById('kreditColor');

const downloadBtn = document.getElementById('download');

// Asset
const logoKoran = new Image();
logoKoran.src = "assets/jawapos-kanan.svg";

const logoBawah = new Image();
logoBawah.src = "assets/logo-bawah.svg";

const ikonKutip = new Image();
ikonKutip.src = "assets/kutipan-quote.svg";

const logoMedsos = new Image();
logoMedsos.src = "assets/medsos-vertikal.svg";

// State
const appState = {
  left: { photo:null, zoom:2, offset:{x:0,y:0}, dragging:false, start:{x:0,y:0}, initial:{x:0,y:0} },
  right:{ photo:null, zoom:2, offset:{x:0,y:0}, dragging:false, start:{x:0,y:0}, initial:{x:0,y:0} }
};

function drawMultilineText(text,x,y,font,color,lineHeight,maxWidth,align='left'){
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  const lines = String(text||"").split(/\n/);
  let currentY = y;
  for(const line of lines){
    const words = line.split(" ");
    let currentLine = words[0]||"";
    for(let i=1;i<words.length;i++){
      const testLine = currentLine+" "+words[i];
      if(ctx.measureText(testLine).width > maxWidth){
        ctx.fillText(currentLine,x,currentY);
        currentY += lineHeight;
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine,x,currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function renderTemplate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const frameMargin = 100;
  const halfW = canvas.width / 2;

  // Latar belakang
  ctx.fillStyle = "#FAF9F6";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Kotak hitam
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.strokeRect(frameMargin, frameMargin, canvas.width - frameMargin*2, canvas.height - frameMargin*2);

  // Foto kiri
  ctx.save();
  ctx.beginPath();
  ctx.rect(0,0,halfW,canvas.height);
  ctx.clip();
  if(appState.left.photo){
    const img = appState.left.photo;
    const scale = Math.max(halfW / img.width, canvas.height / img.height) * appState.left.zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const posX = (halfW - drawW)/2 + appState.left.offset.x;
    const posY = (canvas.height - drawH)/2 + appState.left.offset.y;
    ctx.drawImage(img,posX,posY,drawW,drawH);
  }
  ctx.restore();

  // Foto kanan
  ctx.save();
  ctx.beginPath();
  ctx.rect(halfW,0,halfW,canvas.height);
  ctx.clip();
  if(appState.right.photo){
    const img = appState.right.photo;
    const scale = Math.max(halfW / img.width, canvas.height / img.height) * appState.right.zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const posX = halfW + (halfW - drawW)/2 + appState.right.offset.x;
    const posY = (canvas.height - drawH)/2 + appState.right.offset.y;
    ctx.drawImage(img,posX,posY,drawW,drawH);
  }
  ctx.restore();

  // Logo JawaPos kanan atas
  let topAfterLogo = 100;
  if(logoKoran.complete){
    const w=235, h=69;
    ctx.drawImage(logoKoran, canvas.width - w - 50, 50, w, h);
    topAfterLogo = 50 + h;
  }

  // Logo medsos di bawah logo
  let logoMedsosBottomY = 0;
  if(logoMedsos.complete){
    const baseH = 400;
    const scale = 1.8;
    const h = baseH * scale;
    const w = logoMedsos.naturalWidth * (h / logoMedsos.naturalHeight);
    const x = canvas.width - w - 65;
    const y = topAfterLogo + 1;
    ctx.drawImage(logoMedsos, x, y, w, h);
    logoMedsosBottomY = y + h;
  }

  // Kredit Foto (vertikal di sisi kanan)
  if (kreditInput.value) {
    ctx.save();
    const kreditY = logoMedsosBottomY > 0 ? logoMedsosBottomY + 50 : canvas.height - 100;
    ctx.translate(canvas.width - 50, kreditY);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = kreditColorInput.value || '#000000';
    ctx.font = 'bold 18px "Proxima Nova"';
    ctx.fillText(kreditInput.value, 360, 35);
    ctx.restore();
  }

  // Ikon kutipan di kiri dan kanan dekat garis tengah
  const ikonW = 125;
  const ikonH = ikonKutip.naturalHeight * (ikonW / ikonKutip.naturalWidth);
  const kutipTop = 140;

  if(ikonKutip.complete){
    ctx.drawImage(ikonKutip, halfW - ikonW - 30, kutipTop, ikonW, ikonH);
    ctx.drawImage(ikonKutip, halfW + 30, kutipTop, ikonW, ikonH);
  }

  // Garis tengah dari bawah ikon sampai bawah canvas
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(halfW, kutipTop +100, ikonH);
  ctx.lineTo(halfW, canvas.height - frameMargin);
  ctx.stroke();

  // Logo bawah kiri
  if(logoBawah.complete){
    const w=95,h=95;
    ctx.drawImage(logoBawah, 0, canvas.height - h, w, h);
  }

  // Teks kutipan kiri
  const marginKiri = 40;
  let currentY = kutipTop + ikonH + 50;
  currentY = drawMultilineText(kutipanLeft.value, halfW - marginKiri, currentY,
    '28pt "DM Serif Display"', '#000', 40, halfW - marginKiri - frameMargin, 'right');
  currentY = drawMultilineText(namaLeft.value, halfW - marginKiri, currentY + 8,
    'bold 28px "Proxima Nova"', '#000', 28, halfW - marginKiri - frameMargin, 'right');
  drawMultilineText(jabatanLeft.value, halfW - marginKiri, currentY + 4,
    'italic 28px "Proxima Nova"', '#000', 28, halfW - marginKiri - frameMargin, 'right');

  // Teks kutipan kanan
  currentY = kutipTop + ikonH + 50;
  currentY = drawMultilineText(kutipanRight.value, halfW + marginKiri, currentY,
    '28pt "DM Serif Display"', '#000', 40, halfW - marginKiri - frameMargin, 'left');
  currentY = drawMultilineText(namaRight.value, halfW + marginKiri, currentY + 8,
    'bold 28px "Proxima Nova"', '#000', 28, halfW - marginKiri - frameMargin, 'left');
  drawMultilineText(jabatanRight.value, halfW + marginKiri, currentY + 4,
    'italic 28px "Proxima Nova"', '#000', 28, halfW - marginKiri - frameMargin, 'left');
}

// === EVENT HANDLER ===
function setupUpload(input, side){
  input.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const img = new Image();
      img.onload = ()=>{ appState[side].photo = img; renderTemplate(); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}
setupUpload(uploadPhotoLeft, 'left');
setupUpload(uploadPhotoRight, 'right');

zoomLeft.addEventListener('input', ()=>{ appState.left.zoom = parseFloat(zoomLeft.value); renderTemplate(); });
zoomRight.addEventListener('input', ()=>{ appState.right.zoom = parseFloat(zoomRight.value); renderTemplate(); });

[kutipanLeft,namaLeft,jabatanLeft,kutipanRight,namaRight,jabatanRight,
 kreditInput,kreditColorInput]
  .forEach(el => el.addEventListener('input', renderTemplate));

// Drag foto
let activeSide = null;
canvas.addEventListener('mousedown', e=>{
  activeSide = (e.offsetX < canvas.width/2) ? 'left' : 'right';
  const side = appState[activeSide];
  side.dragging = true;
  side.start = {x:e.clientX,y:e.clientY};
  side.initial = {x:side.offset.x,y:side.offset.y};
});

window.addEventListener('mousemove', e=>{
  if(!activeSide) return;
  const side = appState[activeSide];
  if(!side.dragging) return;
  side.offset.x = side.initial.x + (e.clientX - side.start.x);
  side.offset.y = side.initial.y + (e.clientY - side.start.y);
  renderTemplate();
});

window.addEventListener('mouseup', ()=>{ if(activeSide) appState[activeSide].dragging=false; activeSide=null; });

// Download
downloadBtn.addEventListener('click', ()=>{
  const link = document.createElement('a');
  link.download = 'quote-2-komentar.jpg';
  link.href = canvas.toDataURL('image/jpeg',0.9);
  link.click();
});

// Pastikan asset sudah render
[logoKoran,logoBawah,ikonKutip,logoMedsos].forEach(img=>{
  if(img.complete) renderTemplate(); else img.onload = renderTemplate;
});

renderTemplate();