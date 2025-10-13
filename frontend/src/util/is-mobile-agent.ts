export function isMobileAgent(): boolean {
  if (typeof window === "undefined" || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  const mobileKeywords = [
    "android",
    "webos",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "windows phone",
    "mobile",
  ];

  return mobileKeywords.some((keyword) => userAgent.includes(keyword));
}
