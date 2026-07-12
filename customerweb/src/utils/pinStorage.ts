const PIN_KEY = 'customer_web_pin';
const PIN_SET_KEY = 'customer_web_pin_set';

export function isCustomerPinSet(): boolean {
  try {
    return localStorage.getItem(PIN_SET_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveCustomerPin(pin: string): void {
  try {
    localStorage.setItem(PIN_KEY, pin);
    localStorage.setItem(PIN_SET_KEY, '1');
  } catch {
    // Ignore private-mode failures.
  }
}

export function clearCustomerPin(): void {
  try {
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(PIN_SET_KEY);
  } catch {
    // Ignore.
  }
}
