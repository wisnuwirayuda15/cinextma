import { Google, LockPassword, Mail } from "@/utils/icons";
import { Button, Divider, Input, Link } from "@heroui/react";
import { AuthFormProps } from "./Forms";
import { LoginFormSchema } from "@/schemas/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      loginPassword: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log({
      login: {
        email: data.email,
        password: data.loginPassword,
      },
    });
  });

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
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
          {...register("loginPassword")}
          isInvalid={!!errors.loginPassword?.message}
          errorMessage={errors.loginPassword?.message}
          isRequired
          variant="underlined"
          label="Password"
          placeholder="Enter your password"
          startContent={<LockPassword className="text-xl" />}
        />
        <div className="flex w-full items-center justify-end px-1 py-2">
          <Link
            size="sm"
            className="cursor-pointer text-foreground"
            onClick={() => setForm("forgot")}
          >
            Forgot password?
          </Link>
        </div>
        <Button className="mt-3 w-full" color="primary" type="submit" variant="shadow">
          Sign In
        </Button>
      </form>
      <div className="flex items-center gap-4">
        <Divider className="flex-1" />
        <p className="shrink-0 text-tiny text-default-500">OR</p>
        <Divider className="flex-1" />
      </div>
      <Button startContent={<Google width={24} />} variant="faded">
        Continue with Google
      </Button>
      <p className="text-center text-small">
        Don't have an account?
        <Link isBlock size="sm" className="cursor-pointer" onClick={() => setForm("register")}>
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default AuthLoginForm;
