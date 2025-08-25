import PasswordInput from "@/components/ui/input/PasswordInput";
import { ResetPasswordFormSchema } from "@/schemas/auth";
import { LockPassword } from "@/utils/icons";
import { Button } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthFormProps } from "./Forms";

const AuthResetPasswordForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirm: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log({ data });
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <PasswordInput
        {...register("password")}
        isInvalid={!!errors.password?.message}
        errorMessage={errors.password?.message}
        isRequired
        variant="underlined"
        label="New Password"
        placeholder="Enter your new password"
        startContent={<LockPassword className="text-xl" />}
      />
      <PasswordInput
        {...register("confirm")}
        isInvalid={!!errors.confirm?.message}
        errorMessage={errors.confirm?.message}
        isRequired
        variant="underlined"
        label="Confirm Password"
        placeholder="Confirm your new password"
        startContent={<LockPassword className="text-xl" />}
      />
      <Button className="mt-3 w-full" color="primary" type="submit" variant="shadow">
        Sign In
      </Button>
    </form>
  );
};

export default AuthResetPasswordForm;
