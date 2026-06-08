import { Image, View, StyleSheet } from 'react-native';
import { colors, touch } from '@/theme';

// Stitch frame: 4709d4e8656e42bebf74af7b36e3821a — MindBoard Standalone Icon (Refined)
const iconSource = require('../../assets/mindboard-icon.png');

interface MascotAvatarProps {
  size?: number;
}

export function MascotAvatar({ size = 40 }: MascotAvatarProps) {
  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Image
        accessibilityLabel="MindBoard icon"
        resizeMode="cover"
        source={iconSource}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.primaryContainer,
    borderWidth: touch.strokeWidth,
    borderColor: colors.onPrimaryContainer,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
