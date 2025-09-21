// LINE Mini Dapp Configuration
export const LINE_CONFIG = {
  dappId: 'N68c79c9b36f5a3565ea5cfd4',
  dappName: 'S.P.A.R.K.',
  clientId: '50dea5c1-8537-4278-ad37-7b5112280aea',
  clientSecret: 'e4161bc9-0e0f-4782-91db-78f9e9d7ffb3',
  redirectUri: window.location.origin,
  scope: 'profile openid',
  botId: '', // Add your LINE bot ID if you have one
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
  return window.navigator.userAgent.includes('Line') || 
         window.location.href.includes('line://') ||
         window.parent !== window;
};

// Get LINE user info from URL parameters or localStorage
export const getLineUserInfo = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const lineUserId = urlParams.get('userId') || localStorage.getItem('lineUserId');
  const lineDisplayName = urlParams.get('displayName') || localStorage.getItem('lineDisplayName');
  const linePictureUrl = urlParams.get('pictureUrl') || localStorage.getItem('linePictureUrl');
  
  return {
    userId: lineUserId,
    displayName: lineDisplayName,
    pictureUrl: linePictureUrl,
  };
};

// Save LINE user info to localStorage
export const saveLineUserInfo = (userInfo: any) => {
  if (userInfo.userId) localStorage.setItem('lineUserId', userInfo.userId);
  if (userInfo.displayName) localStorage.setItem('lineDisplayName', userInfo.displayName);
  if (userInfo.pictureUrl) localStorage.setItem('linePictureUrl', userInfo.pictureUrl);
};
