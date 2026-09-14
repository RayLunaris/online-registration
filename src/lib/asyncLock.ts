/**
 * Simple FIFO Async Lock (Mutex) to serialize concurrent operations
 * and eliminate race conditions in in-memory state mutations.
 */
export class AsyncLock {
  private queue: Promise<void> = Promise.resolve();

  /**
   * Acquire the lock, execute the critical section, and automatically release the lock.
   * Ensures that even if the callback throws, subsequent tasks are not blocked.
   */
  async acquire<T>(fn: () => Promise<T> | T): Promise<T> {
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    const currentQueue = this.queue;
    // Chain onto the queue while catching any prior errors so queue never stalls
    this.queue = this.queue
      .catch(() => {})
      .then(() => nextLock);

    await currentQueue.catch(() => {});
    try {
      return await fn();
    } finally {
      release!();
    }
  }
}

/**
 * Shared singleton lock for all demo mode mock store operations.
 */
export const mockStoreLock = new AsyncLock();
