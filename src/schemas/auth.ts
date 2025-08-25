import * as z from "zod";

const AuthFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(25, "Username must not exceed 20 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  loginPassword: z.string(),
  confirm: z.string().min(1, "Password confirmation is required"),
});

const RegisterFormSchema = AuthFormSchema.omit({ loginPassword: true }).refine(
  (data) => data.password === data.confirm,
  {
    message: "Passwords do not match",
    path: ["confirm"],
  },
);

const LoginFormSchema = AuthFormSchema.pick({ email: true, loginPassword: true });

const ForgotPasswordFormSchema = AuthFormSchema.pick({ email: true });

const ResetPasswordFormSchema = AuthFormSchema.pick({
  password: true,
  confirm: true,
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type AuthFormInput = z.infer<typeof AuthFormSchema>;
type RegisterFormInput = z.infer<typeof RegisterFormSchema>;
type LoginFormInput = z.infer<typeof LoginFormSchema>;
type ForgotPasswordFormInput = z.infer<typeof ForgotPasswordFormSchema>;
type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

export {
  AuthFormSchema,
  RegisterFormSchema,
  LoginFormSchema,
  ForgotPasswordFormSchema,
  ResetPasswordFormSchema,
};

export type {
  AuthFormInput,
  RegisterFormInput,
  LoginFormInput,
  ForgotPasswordFormInput,
  ResetPasswordFormInput,
};
