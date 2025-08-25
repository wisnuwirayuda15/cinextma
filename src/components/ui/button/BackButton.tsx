import IconButton from "./IconButton";

export interface BackButtonProps {
  href?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href = "/" }) => {
  return <IconButton icon="line-md:chevron-left" iconSize={32} variant="light" href={href} />;
};

export default BackButton;
