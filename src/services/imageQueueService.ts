import type { Asset } from "expo-media-library";
import { getRandomImageAsset } from "./mediaLibraryService";

const DEFAULT_QUEUE_SIZE = 5;

let queue: Asset[] = [];
let fillPromise: Promise<void> | null = null;

async function fillQueue(targetSize: number = DEFAULT_QUEUE_SIZE) {
  if (fillPromise) {
    return fillPromise;
  }

  fillPromise = (async () => {
    while (queue.length < targetSize) {
      const asset = await getRandomImageAsset();
      if (!asset) {
        break;
      }
      queue.push(asset);
    }
  })();

  try {
    await fillPromise;
  } finally {
    fillPromise = null;
  }
}

export async function getNextQueuedAsset(): Promise<Asset | null> {
  await fillQueue();
  const next = queue.shift() ?? null;
  void fillQueue();
  return next;
}

export async function primeImageQueue(targetSize: number = DEFAULT_QUEUE_SIZE) {
  await fillQueue(targetSize);
}

export function resetImageQueue() {
  queue = [];
  fillPromise = null;
}
