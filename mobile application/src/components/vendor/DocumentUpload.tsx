import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '../../theme';
import type { UploadedDocument } from '../../types/vendor';
import PrimaryButton from '../ui/PrimaryButton';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']);

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

interface DocumentUploadProps {
  label: string;
  required?: boolean;
  document?: UploadedDocument;
  uploading?: boolean;
  progress?: number;
  error?: string;
  onPick: (file: PickedFile) => void;
  onRemove: () => void;
  onRetry?: () => void;
}

function isImage(mimeType?: string) {
  return mimeType?.startsWith('image/');
}

export default function DocumentUpload({
  label,
  required,
  document,
  uploading,
  progress = 0,
  error,
  onPick,
  onRemove,
  onRetry,
}: DocumentUploadProps) {
  const [localError, setLocalError] = useState('');

  const validateAndPick = (file: PickedFile) => {
    setLocalError('');
    if (!ALLOWED_MIME.has(file.mimeType.toLowerCase())) {
      setLocalError('Only JPG, PNG, and PDF are allowed');
      return;
    }
    onPick(file);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    validateAndPick({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setLocalError('Camera permission is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    validateAndPick({
      uri: asset.uri,
      name: asset.fileName ?? `camera-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    });
  };

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > MAX_BYTES) {
      setLocalError('File exceeds 10MB limit');
      return;
    }
    validateAndPick({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? 'application/pdf',
    });
  };

  const displayError = error || localError;
  const hasFile = Boolean(document?.fileUrl || document?.localUri);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {hasFile ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={colors.accentRed} />
          </Pressable>
        ) : null}
      </View>

      {hasFile ? (
        <View style={styles.preview}>
          {isImage(document?.mimeType) || isImage(document?.localUri) ? (
            <Image
              source={{ uri: document?.localUri ?? document?.fileUrl }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.pdfPreview}>
              <Ionicons name="document-text-outline" size={32} color={colors.primary} />
              <Text style={styles.pdfName} numberOfLines={1}>
                {document?.fileName ?? 'Document.pdf'}
              </Text>
            </View>
          )}
          {uploading ? (
            <View style={styles.progressWrap}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          ) : document?.fileUrl ? (
            <View style={styles.uploadedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
              <Text style={styles.uploadedText}>Uploaded</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={() => void pickFromCamera()}>
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <Text style={styles.actionText}>Camera</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => void pickFromGallery()}>
            <Ionicons name="images-outline" size={22} color={colors.primary} />
            <Text style={styles.actionText}>Gallery</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => void pickPdf()}>
            <Ionicons name="document-outline" size={22} color={colors.primary} />
            <Text style={styles.actionText}>PDF</Text>
          </Pressable>
        </View>
      )}

      {displayError ? <Text style={styles.error}>{displayError}</Text> : null}

      {error && onRetry ? (
        <PrimaryButton label="Retry Upload" onPress={onRetry} variant="outline" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  label: { color: colors.textLight, fontWeight: typography.weights.semibold },
  required: { color: colors.accentRed },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.25)',
  },
  actionText: {
    marginTop: spacing.xs,
    color: colors.textLight,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  preview: { alignItems: 'center', gap: spacing.sm },
  previewImage: { width: '100%', height: 160, borderRadius: radius.md },
  pdfPreview: { alignItems: 'center', padding: spacing.lg },
  pdfName: { color: colors.subtext, marginTop: spacing.xs, maxWidth: '100%' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressText: { color: colors.primary, fontWeight: typography.weights.bold },
  uploadedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  uploadedText: { color: '#2E7D32', fontWeight: typography.weights.semibold },
  error: { color: colors.accentRed, marginTop: spacing.sm, fontSize: typography.sizes.sm },
});
