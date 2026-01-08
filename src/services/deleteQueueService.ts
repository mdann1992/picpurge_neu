import AsyncStorage from '@react-native-async-storage/async-storage';

export type DeleteQueueItem = {
  id: string;
  uri: string;
};

const STORAGE_KEY = 'picpurge.deleteQueue';

async function readQueue(): Promise<DeleteQueueItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as DeleteQueueItem[];
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item?.id && item?.uri);
    }
  } catch (error) {
    return [];
  }
  return [];
}

async function writeQueue(queue: DeleteQueueItem[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function getQueue() {
  return readQueue();
}

export async function setQueue(queue: DeleteQueueItem[]) {
  await writeQueue(queue);
  return queue;
}

export async function addToQueue(item: DeleteQueueItem) {
  const queue = await readQueue();
  const exists = queue.some((entry) => entry.id === item.id);
  if (exists) {
    return queue;
  }
  const nextQueue = [...queue, item];
  await writeQueue(nextQueue);
  return nextQueue;
}

export async function removeFromQueue(ids: string[]) {
  const queue = await readQueue();
  const idSet = new Set(ids);
  const nextQueue = queue.filter((item) => !idSet.has(item.id));
  await writeQueue(nextQueue);
  return nextQueue;
}

export async function restoreFromTrash(assetId: string): Promise<void> {
  await restoreManyFromTrash([assetId]);
}

export async function restoreManyFromTrash(assetIds: string[]): Promise<void> {
  if (assetIds.length === 0) {
    return;
  }
  const queue = await readQueue();
  const idSet = new Set(assetIds);
  const nextQueue = queue.filter((item) => !idSet.has(item.id));
  await writeQueue(nextQueue);
}
