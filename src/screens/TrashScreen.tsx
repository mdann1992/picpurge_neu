import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TrashGridItem } from '../components/TrashGridItem';
import { theme } from '../theme/theme';
import { deleteAssets } from '../services/mediaLibraryService';
import {
  DeleteQueueItem,
  getQueue,
  removeFromQueue,
  restoreManyFromTrash,
} from '../services/deleteQueueService';
import type { RootStackParamList } from '../navigation/types';

export function TrashScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Trash'>) {
  const [queue, setQueue] = useState<DeleteQueueItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const refreshQueue = useCallback(async () => {
    const currentQueue = await getQueue();
    setQueue(currentQueue);
    setSelectedIds(new Set());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshQueue();
    }, [refreshQueue])
  );

  const allSelected = useMemo(
    () => queue.length > 0 && selectedIds.size === queue.length,
    [queue.length, selectedIds.size]
  );

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(queue.map((item) => item.id)));
  }, [allSelected, queue]);

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [setSelectedIds]
  );

  const handleDelete = useCallback(() => {
    if (selectedIds.size === 0) {
      return;
    }

    Alert.alert(
      'Delete selected photos?',
      'This will permanently remove the selected photos from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const ids = Array.from(selectedIds);
              await deleteAssets(ids);
              const nextQueue = await removeFromQueue(ids);
              setQueue(nextQueue);
              setSelectedIds(new Set());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { reviewAfterDelete: true } }],
              });
            } catch (error) {
              Alert.alert('Delete failed', 'Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [navigation, selectedIds]);

  const handleRestore = useCallback(async () => {
    if (selectedIds.size === 0) {
      return;
    }
    try {
      setIsRestoring(true);
      const ids = Array.from(selectedIds);
      await restoreManyFromTrash(ids);
      setQueue((prev) => prev.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
    } catch (error) {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setIsRestoring(false);
    }
  }, [selectedIds]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Trash</Text>
        <Pressable style={styles.toggleButton} onPress={toggleSelectAll}>
          <Text style={styles.toggleText}>{allSelected ? 'Deselect all' : 'Select all'}</Text>
        </Pressable>
      </View>
      {queue.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing in the trash</Text>
          <Text style={styles.emptyText}>Swipe right on Home to mark photos for deletion.</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TrashGridItem
              item={item}
              selected={selectedIds.has(item.id)}
              onToggle={() => toggleSelection(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.restoreButton,
            (selectedIds.size === 0 || isRestoring || isDeleting) &&
              styles.restoreButtonDisabled,
          ]}
          disabled={selectedIds.size === 0 || isRestoring || isDeleting}
          onPress={handleRestore}
        >
          {isRestoring ? <ActivityIndicator color="#fff" /> : <Text style={styles.restoreButtonText}>Restore</Text>}
        </Pressable>
        <Pressable
          style={[
            styles.deleteButton,
            (selectedIds.size === 0 || isDeleting || isRestoring) && styles.deleteButtonDisabled,
          ]}
          disabled={selectedIds.size === 0 || isDeleting || isRestoring}
          onPress={handleDelete}
        >
          {isDeleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.title,
    color: theme.colors.text,
    fontWeight: '700',
  },
  toggleButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.title,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  restoreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  restoreButtonDisabled: {
    opacity: 0.5,
  },
  restoreButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: theme.colors.delete,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
