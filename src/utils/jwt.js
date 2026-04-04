
export function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa("superhero-secret");
  return `${header}.${body}.${sig}`;
}

export function decodeToken(token) {
  try {
    const body = token.split(".")[1];
    return JSON.parse(atob(body));
  } catch {
    return null;
  }
}

export function getAllAccounts() {
  try {
    return JSON.parse(localStorage.getItem("accounts") || "[]");
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
    return { success: false, error: "Ù‡Ø°Ø§ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø³Ø¬Ù„ Ù…Ù† Ù‚Ø¨Ù„ØŒ Ø¬Ø±Ø¨ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„" };
  }

  const token = createToken(payload);
  accounts.push(token);
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("token", token);
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
    localStorage.setItem("token", match);
    localStorage.setItem("user", JSON.stringify({ email: data.email, heroName: data.heroName, role: data.role }));
    return { success: true, user: data };
  }

  return { success: false, error: "Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„ Ø£Ùˆ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø®Ø·Ø£" };
}

