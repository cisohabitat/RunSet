/** Ask the active worker to verify all of its own precached assets. */
export function offlineReady(worker: ServiceWorker): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let complete = false;
    const finish = (ready: boolean) => {
      if (complete) return;
      complete = true;
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      resolve(ready);
    };
    const timer = setTimeout(() => finish(false), 1800);
    channel.port1.onmessage = (event) => finish(event.data?.ready === true);
    try {
      worker.postMessage({ type: "CHECK_CACHE" }, [channel.port2]);
    } catch {
      finish(false);
    }
  });
}
