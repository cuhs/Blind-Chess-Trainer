import { StyleSheet, View } from 'react-native';
import { PeekChip } from '@/components/ui/PeekChip';

interface PeekButtonProps {
  onPress: () => void;
}

export function PeekButton({ onPress }: PeekButtonProps) {
  return (
    <View style={styles.wrap}>
      <PeekChip
        label="I forgot... need a peek?"
        onPress={onPress}
        variant="action"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
});
