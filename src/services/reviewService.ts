import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import * as StoreReview from "expo-store-review";

const STORAGE_KEY = "picpurge.hasReviewed_new";

export async function hasReviewed() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw === "true";
}

async function setReviewed() {
  await AsyncStorage.setItem(STORAGE_KEY, "true");
}

export async function maybeRequestReview() {
  const available = await StoreReview.isAvailableAsync();
  if (!available) {
    return false;
  }

  const reviewed = await hasReviewed();
  if (reviewed) {
    return false;
  }

  let didRequest = false;
  await new Promise<void>((resolve) => {
    Alert.alert("Would you like to rate PicPurge?", "", [
      { text: "Later", style: "cancel", onPress: resolve },
      {
        text: "Rate now",
        onPress: async () => {
          await StoreReview.requestReview();
          didRequest = true;
          resolve();
        },
      },
    ]);
  });

  if (didRequest) {
    await setReviewed();
  }

  return didRequest;
}
