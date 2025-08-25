"use client";

import { useDisclosure, useInterval, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
} from "@heroui/react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { IS_BROWSER } from "@/utils/constants";

const Disclaimer: React.FC = () => {
  const [disclaimer, setDisclaimer] = useLocalStorage<boolean>({
    key: "disclaimer-agreed",
    defaultValue: false,
    getInitialValueInEffect: false,
  });
  const interval = useInterval(() => setSeconds((s) => s - 1), 1000, {
    autoInvoke: true,
  });
  const [opened, handlers] = useDisclosure(!disclaimer && IS_BROWSER);
  const [seconds, setSeconds] = useState(10);

  function handleAgree() {
    handlers.close();
    setDisclaimer(true);
  }

  useEffect(() => {
    if (disclaimer || seconds < 0) {
      interval.stop();
    }

    return () => interval.stop();
  }, [seconds]);

  if (disclaimer) return null;

  return (
    <Modal
      hideCloseButton
      isOpen={opened}
      placement="center"
      backdrop="blur"
      size="3xl"
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-3xl uppercase">
          Disclaimer
        </ModalHeader>
        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            <p>
              Welcome to Cinextma - a free and open-source movie streaming website. Please read this
              disclaimer carefully before using this website.
            </p>
            <p>
              Cinextma is developed solely for <strong>educational and learning purposes.</strong>{" "}
              This website is an open-source project intended to demonstrate web development skills
              and is not meant to promote or encourage digital piracy in any form.
            </p>
            <p>
              All content displayed on Cinextma (including but not limited to movies, images,
              posters, and related information) is sourced from{" "}
              <strong>third-party providers through APIs or embedding.</strong> I do not host,
              store, or distribute any media files on my servers. The website merely aggregates
              content that is already available on the internet.
            </p>
            <p>
              By using Cinextma, you acknowledge that I bears no responsibility for user actions,
              content accuracy, or any direct or indirect damages arising from the use of this
              website. Users are solely responsible for their actions while using this service. I
              respect intellectual property rights and will respond to legitimate requests from
              copyright holders for content removal.
            </p>
            <p>
              This website should only be used for learning purposes. Any illegal activities,
              including but not limited to unauthorized downloading, redistribution of content, or
              commercial use, are strictly prohibited. By using Cinextma, you agree to these terms
              and acknowledge that <strong>you use the service at your own risk.</strong>
            </p>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            className={clsx(interval.active && "pointer-events-auto cursor-not-allowed")}
            isDisabled={interval.active}
            color={interval.active ? "danger" : "primary"}
            variant="shadow"
            onPress={handleAgree}
          >
            Agree{interval.active && ` (${seconds})`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Disclaimer;
