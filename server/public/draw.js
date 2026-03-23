(() => {
  const canvas = document.getElementById('drawing-board');
  const bgCanvas = document.getElementById('background-board');
  const toolbar = document.getElementById('toolbar');
  const board = document.getElementById('board');
  const bgUploadInput = document.getElementById('bg-upload');
  const sizeLockNote = document.getElementById('sizeLockNote');
  if (!canvas || !bgCanvas || !toolbar || !board || !bgUploadInput) return;

  const ctx = canvas.getContext('2d');
  const bgCtx = bgCanvas.getContext('2d');
  const sizeButtons = Array.from(toolbar.querySelectorAll('[data-size]'));
  const sizePresets = {
    postcard: { width: 6, height: 4, label: 'Postcard' },
    poster: { width: 18, height: 24, label: 'Poster' },
    banner: { width: 3, height: 1, label: 'Banner' },
  };

  const state = {
    isPainting: false,
    lineWidth: 5,
    strokeStyle: '#111827',
    boardSize: 'postcard',
    sizeLocked: false,
    backgroundImage: null,
  };

  function resizeCanvasToDisplaySize() {
    // preserve both drawing and background layers when resizing
    const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(cssW));
    const h = Math.max(1, Math.floor(cssH));

    if (canvas.width === w && canvas.height === h && bgCanvas.width === w && bgCanvas.height === h) return;

    const snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext('2d').drawImage(canvas, 0, 0);

    const bgSnapshot = document.createElement('canvas');
    bgSnapshot.width = bgCanvas.width;
    bgSnapshot.height = bgCanvas.height;
    bgSnapshot.getContext('2d').drawImage(bgCanvas, 0, 0);

    canvas.width = w;
    canvas.height = h;
    bgCanvas.width = w;
    bgCanvas.height = h;

    ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, w, h);
    bgCtx.drawImage(bgSnapshot, 0, 0, bgSnapshot.width, bgSnapshot.height, 0, 0, w, h);
  }

  resizeCanvasToDisplaySize();
  window.addEventListener('resize', resizeCanvasToDisplaySize);

  function updateSizeLockUi() {
    sizeButtons.forEach((btn) => {
      btn.disabled = state.sizeLocked;
    });
    if (sizeLockNote) {
      sizeLockNote.textContent = state.sizeLocked
        ? 'Artboard size is locked after your first stroke.'
        : 'Size locks after your first stroke.';
    }
  }

  function setSizeLocked(locked) {
    state.sizeLocked = locked;
    updateSizeLockUi();
  }

  function setBoardSize(sizeKey) {
    if (!sizePresets[sizeKey] || state.sizeLocked) return;

    state.boardSize = sizeKey;
    const preset = sizePresets[sizeKey];
    const ratio = `${preset.width} / ${preset.height}`;
    board.style.aspectRatio = ratio;
    board.setAttribute('aria-label', `${preset.label} artboard`);

    sizeButtons.forEach((btn) => {
      const isActive = btn.dataset.size === sizeKey;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    resizeCanvasToDisplaySize();
  }

  setBoardSize(state.boardSize);
  updateSizeLockUi();

  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    state.isPainting = true;
    const { x, y } = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function end() {
    state.isPainting = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!state.isPainting) return;
    ctx.lineWidth = state.lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = state.strokeStyle;

    const { x, y } = pointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!state.sizeLocked) {
      setSizeLocked(true);
    }
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('mousemove', draw);

  function drawImageContain(image, destW, destH) {
    const srcW = image.naturalWidth || image.width;
    const srcH = image.naturalHeight || image.height;
    if (!srcW || !srcH || !destW || !destH) return null;

    const scale = Math.min(destW / srcW, destH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const dx = (destW - drawW) / 2;
    const dy = (destH - drawH) / 2;
    return { dx, dy, drawW, drawH };
  }

  function applyBackgroundImage(image) {
    const placement = drawImageContain(image, bgCanvas.width, bgCanvas.height);
    if (!placement) return;

    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.imageSmoothingEnabled = true;
    bgCtx.imageSmoothingQuality = 'high';
    bgCtx.drawImage(image, placement.dx, placement.dy, placement.drawW, placement.drawH);
    state.backgroundImage = image;
  }

  function loadBackgroundFromFile(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      applyBackgroundImage(image);
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  }

  function buildExportDataUrl() {
    const output = document.createElement('canvas');
    output.width = canvas.width;
    output.height = canvas.height;
    const outputCtx = output.getContext('2d');

    outputCtx.fillStyle = '#ffffff';
    outputCtx.fillRect(0, 0, output.width, output.height);
    outputCtx.drawImage(bgCanvas, 0, 0);
    outputCtx.drawImage(canvas, 0, 0);

    return output.toDataURL('image/png');
  }

  board.addEventListener('dragenter', (e) => {
    e.preventDefault();
    board.classList.add('is-dragover');
  });

  board.addEventListener('dragover', (e) => {
    e.preventDefault();
    board.classList.add('is-dragover');
  });

  board.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (!board.contains(e.relatedTarget)) {
      board.classList.remove('is-dragover');
    }
  });

  board.addEventListener('drop', (e) => {
    e.preventDefault();
    board.classList.remove('is-dragover');
    const file = e.dataTransfer?.files?.[0];
    loadBackgroundFromFile(file);
  });

  // Toolbar controls
  toolbar.addEventListener('click', (e) => {
    const id = e.target?.id;
    const size = e.target?.dataset?.size;

    if (size) {
      setBoardSize(size);
    }

    if (id === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      setSizeLocked(false);
    }

    if (id === 'pick-bg') {
      bgUploadInput.click();
    }
    if (id === 'save') {
      const image = buildExportDataUrl();
      const link = document.createElement('a');
      link.href = image;
      link.download = 'my-drawing.png';
      link.click();
    }
  });

  toolbar.addEventListener('change', (e) => {
    const id = e.target?.id;
    if (id === 'stroke') state.strokeStyle = e.target.value;
    if (id === 'width') state.lineWidth = Number(e.target.value) || 5;
  });

  bgUploadInput.addEventListener('change', (e) => {
    const file = e.target?.files?.[0];
    loadBackgroundFromFile(file);
    // allow selecting the same file repeatedly
    bgUploadInput.value = '';
  });

  // Publish: convert canvas to data URL on submit
  const publishForm = document.getElementById('publishForm');
  const imageDataInput = document.getElementById('imageData');
  if (publishForm && imageDataInput) {
    publishForm.addEventListener('submit', () => {
      imageDataInput.value = buildExportDataUrl();
    });
  }
})();

