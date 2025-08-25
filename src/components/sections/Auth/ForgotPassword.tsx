import { Mail } from "@/utils/icons";
import { Button, Input } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { ForgotPasswordFormSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const AuthForgotPasswordForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log({ forgot: data });
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <Input
        {...register("email")}
        isInvalid={!!errors.email?.message}
        errorMessage={errors.email?.message}
        isRequired
        label="Email Address"
        name="email"
        placeholder="Enter your email"
        type="email"
        variant="underlined"
        startContent={<Mail className="text-xl" />}
      />
      <Button className="mt-3 w-full" color="primary" type="submit" variant="shadow">
        Send
      </Button>
    </form>
  );
};

export default AuthForgotPasswordForm;
