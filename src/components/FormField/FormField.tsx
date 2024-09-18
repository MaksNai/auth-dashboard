import { Text } from "@gravity-ui/uikit";
import { ReactNode } from "react";
import styles from "./formField.module.scss";

export const FormField = ({
  label,
  error,
  children,
}: {
  label?: string;
  error?: string;
  children: ReactNode;
}) => {
  return (
    <div className={styles.formField}>
      {label && <Text variant="body-2">{label}</Text>}
      {children}
      {error && <Text color="danger">{error}</Text>}
    </div>
  );
};
