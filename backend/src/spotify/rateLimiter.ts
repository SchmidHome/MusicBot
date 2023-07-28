let allowedRequests = 0;
setInterval(() => {
  allowedRequests = 10;
}, 2000);

export function canRequest(): boolean {
  if (allowedRequests > 0) {
    allowedRequests--;
    return true;
  }
  return false;
}

export async function awaitRequest(): Promise<void> {
  while (!canRequest()) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
