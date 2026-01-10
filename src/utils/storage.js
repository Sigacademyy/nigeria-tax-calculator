// Utility functions for user-specific storage

export function getUserStorageKey(baseKey) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    return baseKey;
  }
  
  try {
    const user = JSON.parse(currentUser);
    return `${baseKey}_${user.username}`;
  } catch (e) {
    return baseKey;
  }
}

export function getUserData(key, defaultValue = null) {
  const userKey = getUserStorageKey(key);
  const data = localStorage.getItem(userKey);
  if (!data) return defaultValue;
  
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

export function setUserData(key, value) {
  const userKey = getUserStorageKey(key);
  localStorage.setItem(userKey, JSON.stringify(value));
}

export function removeUserData(key) {
  const userKey = getUserStorageKey(key);
  localStorage.removeItem(userKey);
}


