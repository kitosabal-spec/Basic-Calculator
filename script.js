const dispEl = document.getElementById('disp');
const histEl = document.getElementById('hist');

/* ── State ──*/
let cur       = '0';
let prev      = null;
let pendingOp = null;
let freshInput = true;
let lastWasEq  = false;
let lastOpB    = null;

/* ── Helpers ─*/
function fmt(n) {
  if (!isFinite(n)) return n === Infinity ? '∞' : 'Error';
  const rounded = parseFloat(n.toPrecision(10));
  const str = rounded.toString();
  if (str.includes('e')) return str;
  const [intPart, decPart] = str.split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? intFormatted + '.' + decPart : intFormatted;
}

function setDisplay(val) {
  const s = fmt(typeof val === 'number' ? val : parseFloat(val) || 0);
  dispEl.textContent = s;
  const len = s.replace(/[,.\-]/g, '').length + (s.includes('.') ? 0.5 : 0);
  dispEl.style.fontSize =
    len > 14 ? '22px' :
    len > 10 ? '30px' :
    len > 7  ? '36px' : '42px';
}

function compute(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? Infinity : a / b;
  }
  return b;
}

function highlightOp(op) {
  document.querySelectorAll('.btn.op').forEach(b =>
    b.classList.toggle('active-op', b.dataset.val === op)
  );
}

/* ── Actions ─*/
function doDigit(d) {
  if (freshInput) {
    cur = d;
    freshInput = false;
  } else {
    const raw = cur.replace(/[^0-9]/g, '');
    if (raw.length >= 10) return;
    cur = cur === '0' ? d : cur + d;
  }
  lastWasEq = false;
  setDisplay(cur);
}

function doDot() {
  if (freshInput) { cur = '0.'; freshInput = false; }
  else if (!cur.includes('.')) { cur += '.'; }
  lastWasEq = false;
  dispEl.textContent = cur;
}

function doOp(op) {
  const curNum = parseFloat(cur);

  if (pendingOp && !freshInput) {
    const result = compute(prev, curNum, pendingOp);
    prev = result;
    cur = result.toString();
    setDisplay(result);
    histEl.textContent = fmt(result) + ' ' + op;
  } else {
    prev = curNum;
    histEl.textContent = fmt(curNum) + ' ' + op;
  }

  pendingOp = op;
  freshInput = true;
  lastWasEq = false;
  lastOpB = null;
  highlightOp(op);
}

function doEquals() {
  if (!pendingOp) return;

  const a = prev;
  const b = lastWasEq ? lastOpB : parseFloat(cur);

  if (!lastWasEq) lastOpB = b;

  histEl.textContent = fmt(a) + ' ' + pendingOp + ' ' + fmt(b) + ' =';

  const result = compute(a, b, pendingOp);
  prev = result;
  cur = result.toString();
  freshInput = true;
  lastWasEq = true;
  highlightOp(null);
  setDisplay(result);
}

function doClear() {
  cur = '0'; prev = null; pendingOp = null;
  freshInput = true; lastWasEq = false; lastOpB = null;
  histEl.textContent = '';
  highlightOp(null);
  setDisplay(0);
}

function doSign() {
  const n = parseFloat(cur);
  if (n === 0) return;
  cur = (-n).toString();
  setDisplay(-n);
}

function doPercent() {
  let n = parseFloat(cur);
  if (pendingOp === '+' || pendingOp === '−') {
    n = prev * (n / 100);
  } else {
    n = n / 100;
  }
  cur = n.toString();
  freshInput = false;
  lastWasEq = false;
  setDisplay(n);
}

/* ── Event wiring ──*/
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const { action, val } = btn.dataset;
    if (action === 'digit')   doDigit(val);
    else if (action === 'dot')     doDot();
    else if (action === 'op')      doOp(val);
    else if (action === 'equals')  doEquals();
    else if (action === 'clear')   doClear();
    else if (action === 'sign')    doSign();
    else if (action === 'percent') doPercent();
  });
});

/* ── Keyboard support ──*/
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') { doDigit(e.key); return; }
  switch (e.key) {
    case '.': case ',':  doDot(); break;
    case '+':            doOp('+'); break;
    case '-':            doOp('−'); break;
    case '*':            doOp('×'); break;
    case '/':            e.preventDefault(); doOp('÷'); break;
    case 'Enter': case '=': doEquals(); break;
    case 'Escape':       doClear(); break;
    case '%':            doPercent(); break;
    case 'Backspace':
      if (!freshInput && !lastWasEq) {
        cur = cur.length > 1 ? cur.slice(0, -1) : '0';
        if (cur === '-') cur = '0';
        dispEl.textContent = cur;
      }
      break;
  }
});