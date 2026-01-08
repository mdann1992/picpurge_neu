import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import type { Asset } from "expo-media-library";
import { SwipeCard } from "../components/SwipeCard";
import { TopTrashButton } from "../components/TopTrashButton";
import { theme } from "../theme/theme";
import { requestMediaLibraryPermissions } from "../services/mediaLibraryService";
import {
  getNextQueuedAsset,
  primeImageQueue,
  resetImageQueue,
} from "../services/imageQueueService";
import { addToQueue, getQueue } from "../services/deleteQueueService";
import { maybeRequestReview } from "../services/reviewService";
import AdService from "../services/AdService";
import { checkForUpdate } from "../services/updateService";
import type { RootStackParamList } from "../navigation/types";

const EMPTY_MESSAGE = "No photos found in your library.";

export function HomeScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Home">) {
  const [permissionStatus, setPermissionStatus] = useState<
    "loading" | "granted" | "denied"
  >("loading");
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const refreshQueueCount = useCallback(async () => {
    const queue = await getQueue();
    setQueueCount(queue.length);
  }, []);

  const loadNextAsset = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextAsset = await getNextQueuedAsset();
      if (!nextAsset) {
        setAsset(null);
        setIsEmpty(true);
      } else {
        setAsset(nextAsset);
        setIsEmpty(false);
      }
    } catch (error) {
      Alert.alert("Unable to load photos", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRequestPermissions = useCallback(async () => {
    setPermissionStatus("loading");
    try {
      const result = await requestMediaLibraryPermissions();
      if (result.status === "granted") {
        setPermissionStatus("granted");
        await primeImageQueue();
        await loadNextAsset();
      } else {
        resetImageQueue();
        setPermissionStatus("denied");
      }
    } catch (error) {
      resetImageQueue();
      setPermissionStatus("denied");
      console.log(`Permission Error: ${error}`);
      Alert.alert(
        "Unable to request permissions",
        "Please enable photo access in Settings and try again."
      );
    }
  }, [loadNextAsset]);

  useEffect(() => {
    handleRequestPermissions();
  }, [handleRequestPermissions]);

  useEffect(() => {
    checkForUpdate();
  }, []);

  useEffect(() => {
    const needsReview = route.params?.reviewAfterDelete;
    if (needsReview) {
      maybeRequestReview().finally(() => {
        navigation.setParams({ reviewAfterDelete: undefined });
      });
    }
  }, [navigation, route.params?.reviewAfterDelete]);

  useFocusEffect(
    useCallback(() => {
      refreshQueueCount();
    }, [refreshQueueCount])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      headerRight: () => (
        <TopTrashButton
          count={queueCount}
          onPress={() =>
            AdService.startInterstitial(() => navigation.navigate("Trash"))
          }
        />
      ),
    });
  }, [navigation, queueCount]);

  const handleSwipeLeft = useCallback(() => {
    loadNextAsset();
  }, [loadNextAsset]);

  const handleSwipeRight = useCallback(async () => {
    if (!asset) {
      return;
    }
    const nextQueue = await addToQueue({ id: asset.id, uri: asset.uri });
    setQueueCount(nextQueue.length);
    loadNextAsset();
  }, [asset, loadNextAsset]);

  let content: React.ReactNode;
  if (permissionStatus === "loading") {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.helper}>Requesting photo permissions...</Text>
      </View>
    );
  } else if (permissionStatus === "denied") {
    content = (
      <View style={styles.centered}>
        <Text style={styles.title}>We need access to your photos</Text>
        <Text style={styles.helper}>
          PicPurge needs permission to show and delete images. You can grant
          access below.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={handleRequestPermissions}
        >
          <Text style={styles.primaryButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  } else if (isLoading) {
    content = (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  } else if (isEmpty) {
    content = (
      <View style={styles.centered}>
        <Text style={styles.title}>All clear</Text>
        <Text style={styles.helper}>{EMPTY_MESSAGE}</Text>
      </View>
    );
  } else if (asset) {
    content = (
      <SwipeCard
        asset={asset}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    );
  } else {
    content = (
      <View style={styles.centered}>
        <Text style={styles.helper}>{EMPTY_MESSAGE}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>{content}</View>
      <SafeAreaView style={styles.bannerContainer}>
        {AdService.getBannerAd()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.title,
    color: theme.colors.text,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  helper: {
    fontSize: theme.typography.body,
    color: theme.colors.muted,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  primaryButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  bannerContainer: {
    alignItems: "center",
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
});
