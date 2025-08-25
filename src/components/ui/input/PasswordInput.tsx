import { Eye, EyeOff } from "@/utils/icons";
import { Input } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import IconButton from "../button/IconButton";
import { forwardRef } from "react";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "endContent">;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [show, { toggle }] = useDisclosure(false);

  return (
    <Input
      ref={ref}
      type={show ? "text" : "password"}
      endContent={
        <IconButton
          size="sm"
          variant="light"
          onPress={toggle}
          icon={show ? <EyeOff className="text-xl" /> : <Eye className="text-xl" />}
        />
      }
      {...props}
    />
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
