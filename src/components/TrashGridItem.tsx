import React from "react";
import { Pressable, StyleSheet, View, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";
import type { DeleteQueueItem } from "../services/deleteQueueService";

type TrashGridItemProps = {
  item: DeleteQueueItem;
  selected: boolean;
  onToggle: () => void;
};

export function TrashGridItem({
  item,
  selected,
  onToggle,
}: TrashGridItemProps) {
  return (
    <Pressable style={styles.container} onPress={onToggle}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <View style={styles.checkbox}>
        <MaterialIcons
          name={selected ? "check-box" : "check-box-outline-blank"}
          size={22}
          color={selected ? theme.colors.primary : "#fff"}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: theme.spacing.sm,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  checkbox: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    padding: 2,
  },
});
