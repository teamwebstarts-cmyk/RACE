import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DocumentUpload, { type PickedFile } from '../DocumentUpload';
import { colors, spacing, typography } from '../../../theme';
import type { UploadedDocument, WizardDocumentField } from '../../../types/vendor';

interface Props {
  documents: WizardDocumentField[];
  uploaded: UploadedDocument[];
  uploadingType?: string;
  uploadProgress?: number;
  uploadError?: string;
  onUpload: (documentType: string, file: PickedFile) => void;
  onRemove: (documentType: string) => void;
  onRetry?: (documentType: string) => void;
}

export default function DocumentsStep({
  documents,
  uploaded,
  uploadingType,
  uploadProgress,
  uploadError,
  onUpload,
  onRemove,
  onRetry,
}: Props) {
  const [retryType, setRetryType] = useState<string | null>(null);

  return (
    <View>
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.hint}>JPG, PNG, or PDF — max 10MB each</Text>
      {documents.map((doc) => {
        const existing = uploaded.find((u) => u.documentType === doc.type);
        return (
          <DocumentUpload
            key={doc.type}
            label={doc.label}
            required={doc.required}
            document={existing}
            uploading={uploadingType === doc.type}
            progress={uploadingType === doc.type ? uploadProgress : 0}
            error={retryType === doc.type ? uploadError : undefined}
            onPick={(file) => onUpload(doc.type, file)}
            onRemove={() => onRemove(doc.type)}
            onRetry={
              onRetry
                ? () => {
                    setRetryType(doc.type);
                    onRetry(doc.type);
                  }
                : undefined
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  hint: { color: colors.subtext, marginBottom: spacing.md },
});
