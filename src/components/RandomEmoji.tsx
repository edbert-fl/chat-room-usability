import React from "react";

interface RandomEmojiProps {
  id: number;
}

const RandomEmoji: React.FC<RandomEmojiProps> = ({ id }) => {
  const emojis = ["🐶", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐬", "🐳", "🐙",];
  const index = id % emojis.length;
  const emoji = emojis[index];
  return emoji;
};

const RandomGroupsEmoji: React.FC<RandomEmojiProps> = ({ id }) => {
  const emojis = ["😂", "🎉", "🤔", "🙌", "😎", "🥳", "🤗", "🤣", "😊", "🚀"];
  const index = id % emojis.length;
  const emoji = emojis[index];
  return emoji;
};

export { RandomEmoji, RandomGroupsEmoji };
