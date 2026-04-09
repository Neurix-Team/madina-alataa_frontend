// src/services/mockAuth.js

// Mock users for testing
export let MOCK_USERS = [
  {
    id: 1,
    name: 'أدمن النظام',
    email: 'admin@test.com',
    passwordHash: btoa('123456'),
    roles: ['admin'],
    level: 10,
    points: 1000,
  },
  {
    id: 2,
    name: 'متبرع تجريبي',
    email: 'donor@test.com',
    passwordHash: btoa('123456'),
    roles: ['donor'],
    level: 5,
    points: 500,
  },
  {
    id: 3,
    name: 'ولي أمر تجريبي',
    email: 'parent@test.com',
    passwordHash: btoa('123456'),
    roles: ['parent'],
    level: 3,
    points: 200,
  },
  {
    id: 4,
    name: 'متطوع تجريبي',
    email: 'volunteer@test.com',
    passwordHash: btoa('123456'),
    roles: ['volunteer'],
    level: 7,
    points: 700,
  },
];

const getPasswordHash = (password) => {
  try {
    return btoa(String(password));
  } catch {
    return String(password);
  }
};

// Load registered users from localStorage
const loadRegisteredUsers = () => {
  try {
    const stored = localStorage.getItem('madina_registered_users');
    if (stored) {
      const registeredUsers = JSON.parse(stored).map((user) => ({
        ...user,
        passwordHash: user.passwordHash || getPasswordHash(user.password || ''),
      }));
      MOCK_USERS = [...MOCK_USERS, ...registeredUsers];
    }
  } catch (error) {
    console.error('Error loading registered users:', error);
  }
};

// Save registered users to localStorage
const saveRegisteredUsers = () => {
  try {
    const registeredUsers = MOCK_USERS.filter(u => u.id > 4).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      roles: user.roles,
      level: user.level,
      points: user.points,
    }));
    localStorage.setItem('madina_registered_users', JSON.stringify(registeredUsers));
  } catch (error) {
    console.error('Error saving registered users:', error);
  }
};

// Load on module load
loadRegisteredUsers();

// Mock login function
export const mockLogin = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const passwordHash = getPasswordHash(password);
      const user = MOCK_USERS.find(u => u.email === email && u.passwordHash === passwordHash);
      if (user) {
        const { passwordHash: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500); // Simulate API delay
  });
};

// Mock register function
export const mockRegister = async ({ name, email, password, role = 'donor' }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (existingUser) {
        reject(new Error('Email already exists'));
        return;
      }

      const newUser = {
        id: MOCK_USERS.length + 1,
        name,
        email,
        passwordHash: getPasswordHash(password),
        roles: [role],
        level: 1,
        points: 0,
      };

      MOCK_USERS.push(newUser);
      saveRegisteredUsers();

      const { passwordHash: _, ...userWithoutPassword } = newUser;
      resolve(userWithoutPassword);
    }, 500); // Simulate API delay
  });
};

export const mockGuestLogin = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 0,
        name: 'زائر مؤقت',
        email: 'guest@madina.app',
        roles: ['donor'],
        level: 1,
        points: 0,
      });
    }, 200);
  });
};