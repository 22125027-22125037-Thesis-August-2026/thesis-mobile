import React from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { resolveAvatar } from '@/constants';

const PLACEHOLDER = require('../assets/booking/placeholder.png');

interface UserAvatarProps {
  avatarUrl?: string | null;
  size: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Hiển thị ảnh đại diện của người dùng hiện tại. Hỗ trợ avatar mẫu dạng
 * `preset:<key>` (render icon con vật), URL ảnh thật, hoặc ảnh placeholder.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, size, style }) => {
  const resolved = resolveAvatar(avatarUrl);
  const radius = size / 2;

  if (resolved.type === 'preset') {
    return (
      <View
        // `style` first so caller's border/shadow apply, but size + preset
        // background win to keep the colored circle intact.
        style={[
          style,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: resolved.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <MaterialCommunityIcons
          name={resolved.icon}
          size={size * 0.6}
          color="#3C2F2A"
        />
      </View>
    );
  }

  const source =
    resolved.type === 'uri' ? { uri: resolved.uri } : PLACEHOLDER;

  return (
    <Image
      source={source}
      defaultSource={PLACEHOLDER}
      style={
        [style, { width: size, height: size, borderRadius: radius }] as StyleProp<ImageStyle>
      }
    />
  );
};

export default UserAvatar;
