import { Alert, Linking, Platform } from "react-native";
import * as Application from "expo-application";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

type VersionsDoc = {
  ios?: string;
  android?: string;
};

let hasChecked = false;

export async function checkForUpdate(): Promise<boolean> {
  if (hasChecked) {
    return false;
  }
  hasChecked = true;

  try {
    const snapshot = await getDocs(collection(db, "versions"));
    const firstDoc = snapshot.docs[0];
    if (!firstDoc) {
      return false;
    }

    const data = firstDoc.data() as VersionsDoc;
    const installedVersion = Application.nativeApplicationVersion;
    if (!installedVersion) {
      return false;
    }

    const targetVersion = Platform.OS === "android" ? data.android : data.ios;
    if (!targetVersion) {
      return false;
    }

    const isOutdated = installedVersion !== targetVersion;
    if (!isOutdated) {
      return false;
    }

    Alert.alert(
      "Update available",
      "A new version of PicPurge is available. Please update the app.",
      [
        { text: "Later" },
        {
          text: "Update now",
          onPress: () => {
            const storeUrl =
              Platform.OS === "android"
                ? "https://play.google.com/store/apps/details?id=com.deltaapps.PicPurge"
                : "https://apps.apple.com/de/app/picpurge/id6476457013";
            Linking.openURL(storeUrl);
          },
        },
      ],
      { cancelable: true }
    );

    return true;
  } catch (error) {
    console.log("Update check failed", error);
    return false;
  }
}
