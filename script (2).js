const equipmentDefs = {
  laptop: { label: 'Laptop', price: 800, cls: 'laptop' },
  desktop: { label: 'Desktop', price: 1200, cls: 'desktop' },
  server: { label: 'Server', price: 3500, cls: 'server' },
  rack: { label: 'Rack Server', price: 2800, cls: 'rack' },
  switch: { label: 'Switch', price: 600, cls: 'switch' },
  monitor: { label: 'Monitor', price: 350, cls: 'monitor' },
  printer: { label: 'Imprimantă', price: 450, cls: 'printer' },
  ups: { label: 'UPS', price: 500, cls: 'ups' },
  cabinet: { label: 'Cabinet', price: 1500, cls: 'cabinet' }
};

function getEquipmentInputId(type) {
  return `${type}-qty`;
}

function buildEquipmentUI() {
  const list = document.getElementById('equipment-list');
  list.innerHTML = '';

  Object.keys(equipmentDefs).forEach((key) => {
    const def = equipmentDefs[key];
    const wrapper = document.createElement('div');
    wrapper.className = 'equipment-item';

    wrapper.innerHTML = `
      <div>
        <label>${def.label}</label>
        <div class="equipment-price">€${def.price.toLocaleString()}</div>
      </div>
      <div class="equipment-controls">
        <button class="btn-qty" data-type="${key}" data-op="-">−</button>
        <input id="${getEquipmentInputId(key)}" value="0" readonly />
        <button class="btn-qty" data-type="${key}" data-op="+">+</button>
      </div>
    `;

    list.appendChild(wrapper);
  });

  list.querySelectorAll('.btn-qty').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      const op = btn.getAttribute('data-op');
      const input = document.getElementById(getEquipmentInputId(type));
      const current = Number(input.value || 0);
      input.value = op === '+' ? current + 1 : Math.max(0, current - 1);
    });
  });
}

function createDeviceEl(type, text) {
  const el = document.createElement('div');
  el.className = `equipment-placement ${type}`;
  el.textContent = text;
  return el;
}

function getDims(type) {
  const dims = {
    laptop: { w: 110, h: 72 },
    desktop: { w: 96, h: 96 },
    server: { w: 140, h: 58 },
    rack: { w: 72, h: 190 },
    switch: { w: 120, h: 44 },
    monitor: { w: 108, h: 88 },
    printer: { w: 100, h: 110 },
    ups: { w: 88, h: 132 },
    cabinet: { w: 96, h: 280 }
  };
  return dims[type] || { w: 90, h: 90 };
}

function drawLine(svg, x1, y1, x2, y2) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', 'rgba(6, 95, 70, 0.9)');
  line.setAttribute('stroke-width', '3');
  line.setAttribute('stroke-linecap', 'round');
  svg.appendChild(line);
}

function renderMap(items) {
  const canvas = document.getElementById('space-canvas');
  const svg = document.getElementById('space-svg');
  canvas.innerHTML = '';
  svg.innerHTML = '';

  const spaceSize = Math.max(6, Number(document.getElementById('space-input').value || 20));
  const width = Math.min(980, Math.max(700, spaceSize * 34));
  const height = Math.max(420, Math.min(900, spaceSize * 22));

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  let cursorX = 20;
  let cursorY = 20;

  const placements = [];

  // Device list (without rack/cabinet)
  items.forEach((item) => {
    if (item.type === 'rack' || item.type === 'cabinet') return;

    const dim = getDims(item.type);

    for (let i = 0; i < item.qty; i++) {
      if (cursorX + dim.w + 20 > width - 220) {
        cursorX = 20;
        cursorY += dim.h + 24;
      }

      const el = createDeviceEl(item.cls, `${item.label} ${i + 1}`);
      el.style.left = `${cursorX}px`;
      el.style.top = `${cursorY}px`;
      el.style.width = `${dim.w}px`;
      el.style.height = `${dim.h}px`;
      canvas.appendChild(el);
      placements.push({
        cx: cursorX + dim.w / 2,
        cy: cursorY + dim.h / 2
      });
      cursorX += dim.w + 18;
    }
  });

  // Rack (right side)
  const rackDef = items.find((i) => i.type === 'rack');
  const cabinetDef = items.find((i) => i.type === 'cabinet');
  const rackQty = rackDef ? rackDef.qty : 0;
  const cabinetQty = cabinetDef ? cabinetDef.qty : 0;

  let rackCount = Math.max(rackQty, cabinetQty);

  if (rackCount > 0) {
    const rackEl = createDeviceEl('rack', `Rack ${rackCount > 1 ? 1 : ''}`);
    const rackW = 78;
    const rackH = Math.max(180, Math.min(340, height * 0.55));
    const rackX = width - rackW - 28;
    const rackY = (height - rackH) / 2;

    rackEl.style.left = `${rackX}px`;
    rackEl.style.top = `${rackY}px`;
    rackEl.style.width = `${rackW}px`;
    rackEl.style.height = `${rackH}px`;
    canvas.appendChild(rackEl);

    const rackCenter = {
      cx: rackX + rackW / 2,
      cy: rackY + rackH / 2
    };

    // servere lângă rack
    const serverDef = items.find((i) => i.type === 'server');
    if (serverDef) {
      let serverY = rackY + 20;
      for (let i = 0; i < serverDef.qty; i++) {
        const dim = getDims('server');
        const sx = rackX - dim.w - 20;
        const sy = serverY;
        const sEl = createDeviceEl('server', `Server ${i + 1}`);
        sEl.style.left = `${sx}px`;
        sEl.style.top = `${sy}px`;
        sEl.style.width = `${dim.w}px`;
        sEl.style.height = `${dim.h}px`;
        canvas.appendChild(sEl);
        placements.push({ cx: sx + dim.w / 2, cy: sy + dim.h / 2 });
        serverY += dim.h + 18;
      }
    }

    // cabluri de la toate dispozitivele către rack
    placements.forEach((p) => drawLine(svg, p.cx, p.cy, rackCenter.cx, rackCenter.cy));
  } else {
    // dacă nu există rack, trasează către colțul din dreapta
    const fallbackX = width - 80;
    const fallbackY = height / 2;
    placements.forEach((p) => drawLine(svg, p.cx, p.cy, fallbackX, fallbackY));
  }
}

function calculateAndRender() {
  let total = 0;
  const selected = [];

  Object.keys(equipmentDefs).forEach((key) => {
    const qty = Number(document.getElementById(getEquipmentInputId(key)).value || 0);
    if (qty > 0) {
      const itemCost = qty * equipmentDefs[key].price;
      total += itemCost;
      selected.push({
        type: key,
        qty,
        label: equipmentDefs[key].label,
        cls: equipmentDefs[key].cls,
        price: equipmentDefs[key].price
      });
    }
  });

  const summary = document.getElementById('budget-summary');

  if (!selected.length) {
    summary.innerHTML = '<p class="muted">Nicio selecție — alege echipamente</p>';
    return;
  }

  let html = '';
  selected.forEach((item) => {
    const itemTotal = item.qty * item.price;
    html += `
      <div class="budget-item">
        <div>
          <div class="budget-item-name">${item.label}</div>
          <div class="budget-item-qty">${item.qty} × €${item.price.toLocaleString()}</div>
        </div>
        <div class="budget-item-price">€${itemTotal.toLocaleString()}</div>
      </div>
    `;
  });

  html += `
    <div class="budget-total">
      <span>Total</span>
      <span>€${total.toLocaleString()}</span>
    </div>
  `;

  summary.innerHTML = html;
  renderMap(selected);
}

document.addEventListener('DOMContentLoaded', () => {
  buildEquipmentUI();

  document.getElementById('calcBtn').addEventListener('click', calculateAndRender);

  document.getElementById('resetBtn').addEventListener('click', () => {
    Object.keys(equipmentDefs).forEach((key) => {
      document.getElementById(getEquipmentInputId(key)).value = 0;
    });
    document.getElementById('budget-summary').innerHTML = '<p class="muted">Nicio selecție — alege echipamente</p>';
    document.getElementById('space-canvas').innerHTML = '';
    document.getElementById('space-svg').innerHTML = '';
  });

  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('c_name').value.trim();
    const email = document.getElementById('c_email').value.trim();
    const phone = document.getElementById('c_phone').value.trim();
    const message = document.getElementById('c_message').value.trim();
    const status = document.getElementById('contactStatus');

    if (!name || !email || !phone || !message) {
      status.textContent = 'Completeaza toate campurile.';
      status.style.color = 'crimson';
      return;
    }

    const subject = encodeURIComponent(`Solicitare consultanță - ${name}`);
    const body = encodeURIComponent(
      `Nume: ${name}\n` +
      `Email: ${email}\n` +
      `Telefon: ${phone}\n\n` +
      `Mesaj:\n${message}`
    );

    // Destinatar fix: nicoletasenchea12@gmail.com
    window.location.href = `mailto:nicoletasenchea12@gmail.com?subject=${subject}&body=${body}`;

    status.textContent = 'Mesajul a fost pregătit și va fi trimis în aplicația de e-mail.';
    status.style.color = 'green';
    e.target.reset();
  });
});