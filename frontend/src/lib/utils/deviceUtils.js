export function getOrCreateDeviceId() {
  return localStorage.getItem('device_id') || (() => {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    localStorage.setItem('device_id', id);
    return id;
  })();
}

export function getDeviceInfo() {
  const ua = window.navigator.userAgent;
  const deviceMap = {
    'Android': { type: 'mobile', name: 'Android Device' },
    'iPhone|iPad|iPod': { type: 'mobile', name: 'iOS Device' },
    'Windows': { type: 'desktop', name: 'Windows Device' },
    'Macintosh': { type: 'desktop', name: 'Mac Device' },
    'Linux': { type: 'desktop', name: 'Linux Device' }
  };

  for (const [pattern, info] of Object.entries(deviceMap)) {
    if (new RegExp(pattern, 'i').test(ua)) return info;
  }
  
  return { type: 'web', name: 'Browser' };
}
