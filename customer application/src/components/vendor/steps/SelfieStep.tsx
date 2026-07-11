import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DocumentUpload, { type PickedFile } from '../DocumentUpload';
import PrimaryButton from '../../ui/PrimaryButton';
import { colors, spacing, typography } from '../../../theme';
import type { UploadedDocument } from '../../../types/vendor';

interface Props {
  selfie?: UploadedDocument;
  accepted: boolean;
  uploading?: boolean;
  progress?: number;
  error?: string;
  onAcceptTerms: () => void;
  onUpload: (file: PickedFile) => void;
  onRemove: () => void;
}

export default function SelfieStep({
  selfie,
  accepted,
  uploading,
  progress,
  error,
  onAcceptTerms,
  onUpload,
  onRemove,
}: Props) {
  const [consent, setConsent] = useState(accepted);

  return (
    <View>
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.hint}>
        Capture a clear selfie for identity verification. This helps RACE verify you during
        roadside operations.
      </Text>
      <DocumentUpload
        label="Selfie Capture"
        required
        document={selfie}
        uploading={uploading}
        progress={progress}
        error={error}
        onPick={onUpload}
        onRemove={onRemove}
      />
      <PrimaryButton
        label={consent ? 'Digital Consent Accepted' : 'Accept Terms & Digital Consent'}
        variant={consent ? 'outline' : 'primary'}
        onPress={() => {
          setConsent(true);
          onAcceptTerms();
        }}
      />
      <Text style={styles.legal}>
        By continuing, you consent to RACE verifying your identity and documents for partner
        onboarding.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textLight,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  hint: { color: colors.subtext, marginBottom: spacing.md, lineHeight: 20 },
  legal: { color: colors.textMuted, fontSize: typography.sizes.sm, marginTop: spacing.md, lineHeight: 18 },
});
