// LINE Mini Dapp Configuration
export const LINE_CONFIG = {
  // Use Vite env vars for frontend-safe values
  dappId: import.meta.env.VITE_LINE_LIFF_ID || 'N68c79c9b36f5a3565ea5cfd4', // LIFF ID
  dappName: 'S.P.A.R.K.',
  clientId: import.meta.env.VITE_LINE_CLIENT_ID || '50dea5c1-8537-4278-ad37-7b5112280aea',
  // IMPORTANT: Do NOT expose client secrets in frontend code. Keep secrets on server only.
  redirectUri: window.location.origin,
  scope: 'profile openid',
  botId: import.meta.env.VITE_LINE_BOT_ID || '', // LINE bot ID (optional)
};

// LINE Mini Dapp API endpoints
export const LINE_API = {
  auth: 'https://access.line.me/oauth2/v2.1/authorize',
  token: 'https://api.line.me/oauth2/v2.1/token',
  profile: 'https://api.line.me/v2/profile',
  share: 'https://social-plugins.line.me/lineit/share',
};

// Check if running in LINE Mini Dapp environment
export const isLineMiniApp = () => {
  return (
    typeof window !== 'undefined' &&
    (navigator.userAgent.includes('Line') ||
      window.location.href.includes('line://') ||
      // When running inside LIFF in an in-app webview, window.parent may differ
      window.parent !== window)
  );
};

// Get LINE user info from URL parameters or localStorage
export const getLineUserInfo = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lineUserId = urlParams.get('userId') || localStorage.getItem('lineUserId');
  const lineDisplayName = urlParams.get('displayName') || localStorage.getItem('lineDisplayName');
  const linePictureUrl = urlParams.get('pictureUrl') || localStorage.getItem('linePictureUrl');
  
  return {
    userId: lineUserId || undefined,
    displayName: lineDisplayName || undefined,
    pictureUrl: linePictureUrl || undefined,
  } as { userId?: string; displayName?: string; pictureUrl?: string };
};

// Save LINE user info to localStorage
export const saveLineUserInfo = (userInfo: any) => {
  if (userInfo.userId) localStorage.setItem('lineUserId', userInfo.userId);
  if (userInfo.displayName) localStorage.setItem('lineDisplayName', userInfo.displayName);
  if (userInfo.pictureUrl) localStorage.setItem('linePictureUrl', userInfo.pictureUrl);
};
