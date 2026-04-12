import { signOut } from "@/actions/auth";
import useBreakpoints from "@/hooks/useBreakpoints";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { DropdownItemProps } from "@/types/component";
import { env } from "@/utils/env";
import { Gear, Logout, User } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import {
  addToast,
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";

const UserProfileButton: React.FC = () => {
  const router = useRouter();
  const [logout, setLogout] = useState(false);
  const { data: user, isLoading } = useSupabaseUser();
  const { mobile } = useBreakpoints();

  const ITEMS: DropdownItemProps[] = useMemo(
    () => [
      // TODO: Add profile and settings page
      // { label: "Profile", href: "/profile", icon: <User /> },
      // { label: "Settings", href: "/settings", icon: <Gear /> },
      {
        label: "Logout",
        onClick: async () => {
          if (logout) return;
          setLogout(true);
          const { success, message } = await signOut();
          addToast({
            title: message,
            color: success ? "primary" : "danger",
          });
          if (!success) {
            return setLogout(false);
          }
          return router.push("/auth");
        },
        icon: logout ? <Spinner size="sm" color="danger" /> : <Logout />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [logout],
  );

  if (isLoading) return null;

  const guest = !user;
  const avatar =
    env.NEXT_PUBLIC_AVATAR_PROVIDER_URL && user?.email
      ? `${env.NEXT_PUBLIC_AVATAR_PROVIDER_URL}${user.email}`
      : undefined;

  const ProfileButton = (
    <Button
      title={guest ? "Login" : user.username}
      variant="light"
      href={guest ? "/auth" : undefined}
      as={guest ? Link : undefined}
      isIconOnly={guest || mobile}
      endContent={
        !guest ? (
          <Avatar
            showFallback
            src={avatar}
            className="size-7"
            fallback={<User className="text-xl" />}
          />
        ) : undefined
      }
      className="min-w-fit"
    >
      {guest ? (
        <User className="text-xl" />
      ) : (
        <p className="hidden max-w-32 truncate md:block lg:max-w-56">{user.username}</p>
      )}
    </Button>
  );

  if (guest) return ProfileButton;

  return (
    <Dropdown showArrow closeOnSelect={false} className="w-10">
      <DropdownTrigger className="w-10">{ProfileButton}</DropdownTrigger>
      <DropdownMenu
        aria-label="User profile dropdown"
        variant="flat"
        disabledKeys={logout ? ITEMS.map((i) => i.label) : undefined}
      >
        {ITEMS.map(({ label, icon, ...props }) => (
          <DropdownItem key={label} startContent={icon} {...props}>
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserProfileButton;
