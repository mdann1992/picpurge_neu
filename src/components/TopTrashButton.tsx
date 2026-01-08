import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../theme/theme";

type TopTrashButtonProps = {
  count: number;
  onPress: () => void;
};

export function TopTrashButton({ count, onPress }: TopTrashButtonProps) {
  return (
    <Pressable style={styles.container} onPress={onPress} hitSlop={8}>
      <MaterialIcons
        name="delete-outline"
        size={26}
        color={theme.colors.text}
      />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 11,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },
});
