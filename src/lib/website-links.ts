// Keep public website destinations on the same environment as the API.
export function websiteLinks(apiBaseUrl: string) {
  return {
    articles: new URL('/latest-articles', apiBaseUrl).href,
    // Temporary owner-approved destination, matching website ApiConfiguration.
    aiAstrologer: 'https://chatgpt.com/g/g-67b146c065ec8191b7ec0850404fef33-9-star-ki-astrologer',
  };
}
