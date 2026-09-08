const DB_NAME = 'LumoraMediaDB';
const DB_VERSION = 1;
const STORE_WALLPAPERS = 'custom_wallpapers';

export interface StoredMedia {
  id: string;
  name: string;
  type: 'video' | 'image';
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_WALLPAPERS)) {
        db.createObjectStore(STORE_WALLPAPERS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveCustomWallpaperMedia = async (media: StoredMedia): Promise<string> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WALLPAPERS, 'readwrite');
    const store = tx.objectStore(STORE_WALLPAPERS);
    const req = store.put(media);
    req.onsuccess = () => resolve(media.id);
    req.onerror = () => reject(req.error);
  });
};

export const getCustomWallpaperMedia = async (id: string): Promise<StoredMedia | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WALLPAPERS, 'readonly');
    const store = tx.objectStore(STORE_WALLPAPERS);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

export const getAllCustomWallpapers = async (): Promise<StoredMedia[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WALLPAPERS, 'readonly');
    const store = tx.objectStore(STORE_WALLPAPERS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
};

export const deleteCustomWallpaperMedia = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_WALLPAPERS, 'readwrite');
    const store = tx.objectStore(STORE_WALLPAPERS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};
