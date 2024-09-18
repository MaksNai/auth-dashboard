import { RegisterCard } from "@/components/RegisterCard/RegisterCard";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.page}>
      <RegisterCard />
    </main>
  );
}
