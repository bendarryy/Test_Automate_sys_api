import React from 'react';
import { Avatar, theme } from 'antd';

interface ProfileAvatarProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, size = 32, style }) => {
  const { token } = theme.useToken();
  
  // Get the first non-empty name from the string
  const getFirstChar = (nameStr: string) => {
    if (!nameStr) return '?';
    // Split by spaces and get the first non-empty part
    const parts = nameStr.trim().split(/\s+/);
    const firstPart = parts.find(part => part.length > 0);
    return firstPart ? firstPart.charAt(0).toUpperCase() : '?';
  };

  const firstChar = getFirstChar(name);

  return (
    <Avatar
      size={size}
      style={{
        backgroundColor: token.colorPrimary,
        color: token.colorTextLightSolid,
        fontSize: size * 0.4,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {firstChar}
    </Avatar>
  );
};

export default ProfileAvatar; 