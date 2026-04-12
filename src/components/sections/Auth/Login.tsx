import { signIn } from "@/actions/auth";
import PasswordInput from "@/components/ui/input/PasswordInput";
import { LoginFormSchema } from "@/schemas/auth";
import { isEmpty } from "@/utils/helpers";
import { Google, LockPassword, Mail } from "@/utils/icons";
import { addToast, Button, Divider, Input, Link } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthFormProps } from "./Forms";
import { env } from "@/utils/env";
import { useRouter } from "@bprogress/next/app";
import GoogleLoginButton from "@/components/ui/button/GoogleLoginButton";

const AuthLoginForm: React.FC<AuthFormProps> = ({ setForm }) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(LoginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      loginPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && isEmpty(data.captchaToken)) {
      setIsVerifying(true);
      return;
    }

    const { success, message } = await signIn(data);

    addToast({
      title: message,
      color: success ? "success" : "danger",
    });

    if (!success) {
      setValue("captchaToken", undefined);
      setIsVerifying(false);
      return;
    }

    return router.push("/");
  });

  const onCaptchaSuccess = useCallback(
    (token: string) => {
      setValue("captchaToken", token);
      setIsVerifying(false);
      onSubmit();
    },
    [setValue, setIsVerifying, onSubmit],
  );

  const getButtonText = useCallback(() => {
    if (isSubmitting) return "Signing In...";
    if (isVerifying) return "Verifying...";
    return "Sign In";
  }, [isSubmitting, isVerifying]);

  return (
    <div className="flex flex-col gap-5">
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <p className="text-small text-foreground-500 mb-4 text-center">
          Sign in to continue your streaming journey
        </p>
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
          isDisabled={isSubmitting || isVerifying}
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
          isDisabled={isSubmitting || isVerifying}
        />
        <div className="flex w-full items-center justify-end px-1 py-2">
          <Link
            size="sm"
            className="text-foreground cursor-pointer"
            onClick={() => setForm("forgot")}
            isDisabled={isSubmitting || isVerifying}
          >
            Forgot password?
          </Link>
        </div>
        {isVerifying && env.NEXT_PUBLIC_CAPTCHA_SITE_KEY && (
          <Turnstile
            className="flex h-fit w-full items-center justify-center"
            siteKey={env.NEXT_PUBLIC_CAPTCHA_SITE_KEY!}
            onSuccess={onCaptchaSuccess}
          />
        )}
        <Button
          className="mt-4"
          color="primary"
          type="submit"
          variant="shadow"
          isLoading={isSubmitting || isVerifying}
        >
          {getButtonText()}
        </Button>
      </form>
      <div className="flex items-center gap-4">
        <Divider className="flex-1" />
        <p className="text-tiny text-default-500 shrink-0">OR</p>
        <Divider className="flex-1" />
      </div>
      <GoogleLoginButton isDisabled={isSubmitting || isVerifying} />
      <p className="text-small text-center">
        Don't have an account?
        <Link
          isBlock
          size="sm"
          className="cursor-pointer"
          onClick={() => setForm("register")}
          isDisabled={isSubmitting || isVerifying}
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default AuthLoginForm;
