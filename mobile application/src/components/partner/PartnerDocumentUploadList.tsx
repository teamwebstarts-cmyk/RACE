import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { CloudUpload, type LucideIcon } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../../theme';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']);

export interface PartnerDocumentFieldConfig {
  id: string;
  label: string;
  hint?: string;
  required: boolean;
  Icon: LucideIcon;
}

interface PartnerDocumentUploadListProps {
  documents: PartnerDocumentFieldConfig[];
  uploadedIds: string[];
  onUpload: (id: string, uri: string, name: string, mimeType?: string) => void;
}

export default function PartnerDocumentUploadList({
  documents,
  uploadedIds,
  onUpload,
}: PartnerDocumentUploadListProps) {
  return (
    <View>
      <Text style={styles.listTitle}>Required Documents</Text>
      {documents.map((doc) => {
        const uploaded = uploadedIds.includes(doc.id);
        const Icon = doc.Icon;

        return (
          <View key={doc.id} style={styles.row}>
            <View style={styles.iconWrap}>
              <Icon size={18} color={colors.partnerRed} strokeWidth={2} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.docTitle}>{doc.label}</Text>
              {doc.hint ? <Text style={styles.docHint}>{doc.hint}</Text> : null}
              <View
                style={[
                  styles.badge,
                  doc.required ? styles.badgeRequired : styles.badgeOptional,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    doc.required ? styles.badgeTextRequired : styles.badgeTextOptional,
                  ]}>
                  {doc.required ? 'Required' : 'Optional'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => void pickDocument(doc, uploaded, onUpload)}
              style={({ pressed }) => [
                styles.uploadBtn,
                uploaded && styles.uploadBtnDone,
                pressed && styles.pressed,
              ]}>
              <CloudUpload
                size={16}
                color={uploaded ? colors.partnerRed : colors.grey}
                strokeWidth={2}
              />
              <Text style={[styles.uploadLabel, uploaded && styles.uploadLabelDone]}>
                {uploaded ? 'Uploaded' : 'Upload'}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Ensure all documents are clear and information is readable. Supported formats: JPG, PNG,
          PDF (Max 5MB each)
        </Text>
      </View>
    </View>
  );
}

async function pickDocument(
  doc: PartnerDocumentFieldConfig,
  uploaded: boolean,
  onUpload: PartnerDocumentUploadListProps['onUpload'],
) {
  if (uploaded) {
    Alert.alert(doc.label, 'Document already uploaded. Pick again to replace?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replace', onPress: () => void launchPicker(doc, onUpload) },
    ]);
    return;
  }
  await launchPicker(doc, onUpload);
}

function validateFile(
  mimeType: string,
  size?: number | null,
): { ok: true } | { ok: false; message: string } {
  const normalized = mimeType.toLowerCase();
  if (!ALLOWED_MIME.has(normalized)) {
    return { ok: false, message: 'Only JPG, PNG, and PDF files are allowed' };
  }
  if (size && size > MAX_BYTES) {
    return { ok: false, message: 'File exceeds 5MB limit' };
  }
  return { ok: true };
}

function submitFile(
  doc: PartnerDocumentFieldConfig,
  onUpload: PartnerDocumentUploadListProps['onUpload'],
  file: { uri: string; name: string; mimeType: string; size?: number | null },
) {
  const validation = validateFile(file.mimeType, file.size);
  if (!validation.ok) {
    Alert.alert('Invalid file', validation.message);
    return;
  }
  onUpload(doc.id, file.uri, file.name, file.mimeType);
}

async function launchPicker(
  doc: PartnerDocumentFieldConfig,
  onUpload: PartnerDocumentUploadListProps['onUpload'],
) {
  Alert.alert('Upload document', doc.label, [
    {
      text: 'Gallery',
      onPress: async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.85,
        });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        submitFile(doc, onUpload, {
          uri: asset.uri,
          name: asset.fileName ?? `${doc.id}.jpg`,
          mimeType: asset.mimeType ?? 'image/jpeg',
          size: asset.fileSize,
        });
      },
    },
    {
      text: 'Camera',
      onPress: async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        submitFile(doc, onUpload, {
          uri: asset.uri,
          name: asset.fileName ?? `${doc.id}.jpg`,
          mimeType: asset.mimeType ?? 'image/jpeg',
          size: asset.fileSize,
        });
      },
    },
    {
      text: 'Browse Files',
      onPress: async () => {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        submitFile(doc, onUpload, {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/pdf',
          size: asset.size,
        });
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}

const styles = StyleSheet.create({
  listTitle: {
    color: colors.dark,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.partnerRedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  docTitle: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  docHint: {
    marginTop: 2,
    color: colors.grey,
    fontSize: typography.sizes.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeRequired: {
    backgroundColor: '#FFF0C2',
  },
  badgeOptional: {
    backgroundColor: colors.lightGrey,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  badgeTextRequired: {
    color: colors.partnerRed,
  },
  badgeTextOptional: {
    color: colors.grey,
  },
  uploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 4,
  },
  uploadBtnDone: {
    borderColor: '#F5D98A',
    backgroundColor: colors.partnerRedLight,
  },
  uploadLabel: {
    color: colors.grey,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  uploadLabelDone: {
    color: colors.partnerRed,
  },
  infoBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.partnerRedLight,
  },
  infoText: {
    color: colors.dark,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.relaxed,
  },
  pressed: {
    opacity: 0.9,
  },
});
