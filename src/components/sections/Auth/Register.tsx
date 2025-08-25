import { Google, LockPassword, Mail, User } from "@/utils/icons";
import { Button, Divider, Input, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { RegisterFormSchema } from "@/schemas/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const AuthRegisterForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RegisterFormSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log({ register: data });
  });

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <Input
          {...register("username")}
          isInvalid={!!errors.username?.message}
          errorMessage={errors.username?.message}
          isRequired
          label="Username"
          placeholder="Enter your username"
          variant="underlined"
          startContent={<User className="text-xl" />}
        />
        <Input
          {...register("email")}
          isInvalid={!!errors.email?.message}
          errorMessage={errors.email?.message}
          isRequired
          label="Email Address"
          placeholder="Enter your email"
          type="email"
          variant="underlined"
          startContent={<Mail className="text-xl" />}
        />
        <PasswordInput
          {...register("password")}
          isInvalid={!!errors.password?.message}
          errorMessage={errors.password?.message}
          isRequired
          variant="underlined"
          label="Password"
          placeholder="Enter your password"
          startContent={<LockPassword className="text-xl" />}
        />
        <PasswordInput
          {...register("confirm")}
          isInvalid={!!errors.confirm?.message}
          errorMessage={errors.confirm?.message}
          isRequired
          variant="underlined"
          label="Confirm Password"
          placeholder="Confirm your password"
          startContent={<LockPassword className="text-xl" />}
        />
        <Button className="mt-3 w-full" color="primary" type="submit" variant="shadow">
          Sign Up
        </Button>
      </form>
      <div className="flex items-center gap-4 py-2">
        <Divider className="flex-1" />
        <p className="shrink-0 text-tiny text-default-500">OR</p>
        <Divider className="flex-1" />
      </div>
      <Button startContent={<Google width={24} />} variant="faded">
        Continue with Google
      </Button>
      <p className="text-center text-small">
        Already have an account?
        <Link isBlock onClick={() => setForm("login")} size="sm" className="cursor-pointer">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default AuthRegisterForm;
