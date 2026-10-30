// Keep public website destinations on the same environment as the API.
export function websiteLinks(apiBaseUrl: string) {
  return {
    articles: new URL('/latest-articles', apiBaseUrl).href,
  };
}
