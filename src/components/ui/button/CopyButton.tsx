"use client";

import IconButton, { IconButtonProps } from "./IconButton";
import { useClipboard } from "@mantine/hooks";
import { FaCheck } from "react-icons/fa6";
import { MdContentCopy } from "react-icons/md";
import { toast } from "sonner";

interface CopyButtonProps {
  text: string;
  timeout?: number;
  label?: string;
  copiedLabel?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  timeout = 2000,
  label,
  copiedLabel = "Copied to clipboard!",
}) => {
  const { copy, copied } = useClipboard({ timeout });
  const icon = copied ? <FaCheck size={20} /> : <MdContentCopy size={20} />;

  const handleCopy = () => {
    copy(text);
    toast.success(copiedLabel);
  };

  const buttonProps: IconButtonProps = {
    onClick: handleCopy,
    isDisabled: copied,
    radius: "full",
    icon: icon,
    variant: "faded",
    size: "lg",
  };

  if (!label) {
    return <IconButton {...buttonProps} />;
  }

  return (
    <button onClick={handleCopy} disabled={copied} className="flex items-center gap-2">
      <IconButton {...buttonProps} />
      <p className="text-medium">{label}</p>
    </button>
  );
};

export default CopyButton;
