import * as MediaLibrary from 'expo-media-library';

const PAGE_SIZE = 50;

export async function requestMediaLibraryPermissions() {
  const existing = await MediaLibrary.getPermissionsAsync();
  if (existing.status === 'granted') {
    return existing;
  }
  return MediaLibrary.requestPermissionsAsync();
}

export async function getRandomImageAsset(): Promise<MediaLibrary.Asset | null> {
  const seed = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: MediaLibrary.MediaType.photo,
  });

  if (seed.totalCount === 0) {
    return null;
  }

  const targetIndex = Math.floor(Math.random() * seed.totalCount);
  let remainingIndex = targetIndex;
  let after: string | undefined;

  // MediaLibrary doesn't expose offset queries, so we walk pages to the random index.
  // This avoids loading the entire library at once while still sampling randomly.
  while (true) {
    const page = await MediaLibrary.getAssetsAsync({
      first: PAGE_SIZE,
      after,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [MediaLibrary.SortBy.creationTime],
    });

    if (page.assets.length === 0) {
      return null;
    }

    if (remainingIndex < page.assets.length) {
      return page.assets[remainingIndex];
    }

    remainingIndex -= page.assets.length;
    after = page.endCursor;

    if (!page.hasNextPage) {
      return page.assets[page.assets.length - 1] ?? null;
    }
  }
}

export async function deleteAssets(assetIds: string[]) {
  if (assetIds.length === 0) {
    return;
  }
  await MediaLibrary.deleteAssetsAsync(assetIds);
}
