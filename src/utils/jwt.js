
export function createToken(payload) {
  const header = btoa(JSON.stringify({ typ: 'CLIENT' }));
  const body = btoa(JSON.stringify(payload));
  const nonce = btoa(Array.from(window.crypto?.getRandomValues?.(new Uint8Array(12)) || new Uint8Array(12)).map((b) => b.toString(16).padStart(2, '0')).join(''));
  return `${header}.${body}.${nonce}`;
}

export function decodeToken(token) {
  try {
    const body = token.split('.')[1];
    return JSON.parse(atob(body));
  } catch {
    return null;
  }
}

export function getAllAccounts() {
  try {
    return JSON.parse(localStorage.getItem('accounts') || '[]');
  } catch {
    return [];
  }
}

export function registerAccount(payload) {
  const accounts = getAllAccounts();

  const exists = accounts.find((acc) => {
    const data = decodeToken(acc);
    return data && data.email === payload.email;
  });

  if (exists) {
    return { success: false, error: 'هذا الحساب مسجل من قبل، جرب تسجيل الدخول' };
  }

  const token = createToken(payload);
  accounts.push(token);
  localStorage.setItem('accounts', JSON.stringify(accounts));
  localStorage.setItem('token', token);
  return { success: true, token };
}

export function loginAccount(email, password) {
  const accounts = getAllAccounts();

  const match = accounts.find((acc) => {
    const data = decodeToken(acc);
    return data && data.email === email && data.password === password;
  });

  if (match) {
    const data = decodeToken(match);
    localStorage.setItem('token', match);
    localStorage.setItem('user', JSON.stringify({ email: data.email, heroName: data.heroName, role: data.role }));
    return { success: true, user: data };
  }

  return { success: false, error: 'الإيميل أو كلمة المرور خطأ' };
}

