"use client";

import { Moon, Sun } from "@gravity-ui/icons";
import { Switch, Text, ThemeProvider, ThemeType } from "@gravity-ui/uikit";
import { ReactNode, useEffect, useState } from "react";
import styles from "./themeToggler.module.scss";

export const ThemeToggler = ({ children }: { children: ReactNode }) => {
  // Lефолтная тема 'light' до загрузки
  const [theme, setTheme] = useState<ThemeType>("light");

  // Инициализация темы из localStorage или по системным настройкам
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemPreference);
      localStorage.setItem("theme", systemPreference);
    }
  }, []);

  // Переключение темы
  const switchTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div>
        <div className={styles.toggler}>
          {theme === "dark" ? <Moon /> : <Sun />}
          <Text>
            <b>{theme === "dark" ? "Dark" : "Light"}</b> theme
          </Text>
          <Switch
            checked={theme === "dark" ? true : false}
            onUpdate={switchTheme}
          />
        </div>

        {children}
      </div>
    </ThemeProvider>
  );
};
