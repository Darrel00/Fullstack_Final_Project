(() => {
  const canvas = document.getElementById('drawing-board');
  const toolbar = document.getElementById('toolbar');
  if (!canvas || !toolbar) return;

  const ctx = canvas.getContext('2d');

  const state = {
    isPainting: false,
    lineWidth: 5,
    strokeStyle: '#111827',
  };

  function resizeCanvasToDisplaySize() {
    // preserve current drawing when resizing
    const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(cssW));
    const h = Math.max(1, Math.floor(cssH));

    if (canvas.width === w && canvas.height === h) return;

    const snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(snapshot, 0, 0, snapshot.width, snapshot.height, 0, 0, w, h);
  }

  resizeCanvasToDisplaySize();
  window.addEventListener('resize', resizeCanvasToDisplaySize);

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
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('mousemove', draw);

  // Toolbar controls
  toolbar.addEventListener('click', (e) => {
    const id = e.target?.id;
    if (id === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }
    if (id === 'save') {
      const image = canvas.toDataURL('image/png');
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

  // Publish: convert canvas to data URL on submit
  const publishForm = document.getElementById('publishForm');
  const imageDataInput = document.getElementById('imageData');
  if (publishForm && imageDataInput) {
    publishForm.addEventListener('submit', () => {
      imageDataInput.value = canvas.toDataURL('image/png');
    });
  }
})();

