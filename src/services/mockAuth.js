// src/services/mockAuth.js

// Mock users for testing
export let MOCK_USERS = [
  {
    id: 1,
    name: 'أدمن النظام',
    email: 'admin@test.com',
    password: '123456',
    roles: ['admin'],
    level: 10,
    points: 1000,
  },
  {
    id: 2,
    name: 'متبرع تجريبي',
    email: 'donor@test.com',
    password: '123456',
    roles: ['donor'],
    level: 5,
    points: 500,
  },
  {
    id: 3,
    name: 'ولي أمر تجريبي',
    email: 'parent@test.com',
    password: '123456',
    roles: ['parent'],
    level: 3,
    points: 200,
  },
  {
    id: 4,
    name: 'متطوع تجريبي',
    email: 'volunteer@test.com',
    password: '123456',
    roles: ['volunteer'],
    level: 7,
    points: 700,
  },
];

// Load registered users from localStorage
const loadRegisteredUsers = () => {
  try {
    const stored = localStorage.getItem('madina_registered_users');
    if (stored) {
      const registeredUsers = JSON.parse(stored);
      MOCK_USERS = [...MOCK_USERS, ...registeredUsers];
    }
  } catch (error) {
    console.error('Error loading registered users:', error);
  }
};

// Save registered users to localStorage
const saveRegisteredUsers = () => {
  try {
    const registeredUsers = MOCK_USERS.filter(u => u.id > 4); // Only save users with id > 4 (registered ones)
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
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
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
      // Check if email already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      if (existingUser) {
        reject(new Error('Email already exists'));
        return;
      }

      // Create new user
      const newUser = {
        id: MOCK_USERS.length + 1,
        name,
        email,
        password, // In real app, this would be hashed
        roles: [role],
        level: 1,
        points: 0,
      };

      // Add to mock users (in real app, this would be saved to database)
      MOCK_USERS.push(newUser);
      saveRegisteredUsers();

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      resolve(userWithoutPassword);
    }, 500); // Simulate API delay
  });
};