interface AvatarProps {
  fullName?: string;
  className?: string;
}

export const UserAvatar = ({ fullName, className }: AvatarProps) => {
  // Logic lấy chữ cái đầu
  const firstLetter = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <div
      className={`bg-lime-primary text-white flex items-center justify-center font-bold rounded-full ${className}`}
    >
      {firstLetter}
    </div>
  );
};
