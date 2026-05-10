class Calculator {
  constructor() {
    this.display = document.getElementById('disp');
    this.history = document.getElementById('hist');
    this.currentValue = '0';
    this.previousValue = '';
    this.operation = null;
    this.shouldResetDisplay = false;

    this.init();
  }

  init() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleClick(e));
    });
  }

  handleClick(e) {
    const btn = e.target;
    const action = btn.dataset.action;

    switch (action) {
      case 'digit':
        this.addDigit(btn.dataset.val);
        break;
      case 'dot':
        this.addDot();
        break;
      case 'op':
        this.setOperation(btn.dataset.val);
        break;
      case 'equals':
        this.calculate();
        break;
      case 'clear':
        this.clear();
        break;
      case 'delete':
        this.delete();
        break;
      case 'sign':
        this.toggleSign();
        break;
      case 'percent':
        this.percent();
        break;
    }

    this.updateDisplay();
  }

  addDigit(digit) {
    if (this.shouldResetDisplay) {
      this.currentValue = digit;
      this.shouldResetDisplay = false;
    } else {
      this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
    }
  }

  addDot() {
    if (this.shouldResetDisplay) {
      this.currentValue = '0.';
      this.shouldResetDisplay = false;
    } else if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
  }

  setOperation(op) {
    if (this.operation !== null) {
      this.calculate();
    }
    this.previousValue = this.currentValue;
    this.operation = op;
    this.shouldResetDisplay = true;
    this.updateOperationDisplay();
  }

  calculate() {
    if (this.operation === null || this.shouldResetDisplay) return;

    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result;

    switch (this.operation) {
      case '+':
        result = prev + current;
        break;
      case '−':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        result = current !== 0 ? prev / current : 0;
        break;
      default:
        return;
    }

    this.currentValue = result.toString();
    this.previousValue = '';
    this.operation = null;
    this.shouldResetDisplay = true;
  }

  clear() {
    this.currentValue = '0';
    this.previousValue = '';
    this.operation = null;
    this.shouldResetDisplay = false;
    this.history.textContent = '';
  }

  delete() {
    if (this.shouldResetDisplay) return;
    this.currentValue = this.currentValue.slice(0, -1) || '0';
  }

  toggleSign() {
    const num = parseFloat(this.currentValue);
    this.currentValue = (num * -1).toString();
  }

  percent() {
    const num = parseFloat(this.currentValue);
    this.currentValue = (num / 100).toString();
  }

  updateDisplay() {
    this.display.textContent = this.currentValue;
  }

  updateOperationDisplay() {
    if (this.operation) {
      this.history.textContent = `${this.previousValue} ${this.operation}`;
    } else {
      this.history.textContent = '';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Calculator();
});
