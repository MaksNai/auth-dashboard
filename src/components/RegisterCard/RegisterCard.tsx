"use client";

import { PasswordInput } from "@gravity-ui/components";
import { DatePicker } from "@gravity-ui/date-components";
import { DateTime, dateTimeParse } from "@gravity-ui/date-utils";
import { Xmark } from "@gravity-ui/icons";
import {
  Button,
  Card,
  Checkbox,
  Icon,
  Progress,
  RadioGroup,
  Select,
  Text,
  TextInput,
} from "@gravity-ui/uikit";

import { FormField, TermsModal } from "@/components/";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./registerCard.module.scss";

interface GenderOption {
  value: string;
  content: string;
}

const genderOptions: GenderOption[] = [
  { value: "male", content: "Мужчина" },
  { value: "female", content: "Женщина" },
];

interface CountryOption {
  value: string;
  content: string;
}

interface Country {
  name: { common: string };
  flag: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: DateTime | null;
  gender: string;
  country: string;
  avatar: File | null;
  acceptTerms: boolean;
}

export const RegisterCard = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: null,
      gender: "",
      country: "",
      avatar: null,
      acceptTerms: false,
    },
  });

  const [progressValue, setProgressValue] = useState<number>(0);
  const [datePickerValidationState, setDatePickerValidationState] = useState<
    undefined | "invalid"
  >(undefined);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const maxDate = dateTimeParse(Date.now());
  const minDate = dateTimeParse(
    new Date().setFullYear(new Date().getFullYear() - 130)
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setValue("avatar", file);
      const previewURL = URL.createObjectURL(file);
      setAvatarPreview(previewURL);
    }
  };

  const handleDeleteFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setSelectedFileName(null);
      setValue("avatar", null);
      setAvatarPreview(null);
    }
  };

  const handleDateChange = (dateTime: DateTime | null) => {
    if (dateTime) {
      setValue("dateOfBirth", dateTime);
      setDatePickerValidationState(undefined);
    } else {
      setValue("dateOfBirth", null);
      setDatePickerValidationState("invalid");
    }
  };

  const handleFormSubmit = (data: FormData) => {
    console.log("Submitted data:", data);
  };

  const handleResetForm = () => {
    reset({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: null,
      gender: "",
      country: "",
      avatar: null,
      acceptTerms: false,
    });

    setAvatarPreview(null);
    setSelectedFileName(null);
  };

  const watchedFields = watch();

  // Use useEffect to calculate and set the progress value
  useEffect(() => {
    const filledFieldsCount = Object.values(watchedFields).filter(
      (val) => val
    ).length;
    const totalFields = 8;
    setProgressValue((filledFieldsCount / totalFields) * 100);
  }, [watchedFields]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        if (response.ok) {
          const data: Country[] = await response.json();
          const formattedArray = data.map((element) => {
            return {
              value: element.name.common,
              content: `${element.flag} ${element.name.common}`,
            };
          });

          setCountries(formattedArray);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error)
          console.error(`Не удалось загрузить страны ${error.message}`);
      }
    };

    fetchCountries();
  }, []);

  return (
    <section className={styles.registerWrapper}>
      <Card view="filled" size="l" className={styles.registerContent}>
        <div className={styles.progressInfo}>
          <Text>Прогресс заполнения</Text>
          <Progress
            value={progressValue}
            className={styles.progress}
            size="s"
            theme="info"
            colorStops={[
              { theme: "danger", stop: 20 },
              { theme: "warning", stop: 50 },
              { theme: "success", stop: 100 },
            ]}
          />
        </div>

        <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
          <Text variant="header-1">Регистрация</Text>

          <FormField label="Имя" error={errors.name?.message}>
            <TextInput
              {...register("name", {
                required: "Укажите имя",
              })}
              size="l"
              error={!!errors.name}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <TextInput
              {...register("email", {
                required: "Укажите почту",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Некорректный email",
                },
              })}
              type="email"
              size="l"
              error={!!errors.email}
              onBlur={() => trigger("email")}
            />
          </FormField>
          <FormField label="Пароль" error={errors.password?.message}>
            <PasswordInput
              size="l"
              value={watch("password") || ""}
              onUpdate={(value) => setValue("password", value)}
              errorMessage={errors.password?.message}
              showRevealButton
            />
          </FormField>

          <FormField
            label="Подтвердите пароль"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              size="l"
              value={watch("confirmPassword") || ""}
              onUpdate={(value) => setValue("confirmPassword", value)}
              {...register("confirmPassword", {
                required: "Подтвердите пароль",
                validate: (value) =>
                  value === watch("password") || "Пароли не совпадают",
              })}
              onBlur={() => trigger("confirmPassword")}
              validationState={!!errors.confirmPassword ? "invalid" : undefined}
            />
          </FormField>

          <FormField label="Дата рождения" error={errors.dateOfBirth?.message}>
            <DatePicker
              size="l"
              value={watchedFields.dateOfBirth}
              onUpdate={handleDateChange}
              validationState={datePickerValidationState || undefined}
              errorMessage={errors.dateOfBirth?.message}
              minValue={minDate}
              maxValue={maxDate}
            />
          </FormField>

          <FormField label="Пол" error={errors.gender?.message}>
            <RadioGroup
              {...register("gender", { required: "Выберите пол" })}
              options={genderOptions}
              value={watchedFields.gender}
              onChange={(e) => setValue("gender", e.target.value)}
            />
          </FormField>
          <FormField label="Страна" error={errors.country?.message}>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <Select
                {...register("country")}
                size="l"
                options={countries}
                value={watchedFields.country ? [watchedFields.country] : []}
                onUpdate={(value: string[]) => setValue("country", value[0])}
                filterable
              />
            )}
          </FormField>

          <FormField label="Загрузите аватар">
            <div className={styles.avatarField}>
              <div>
                <label className={styles.fileButtonLabel}>
                  <input
                    {...register("avatar")}
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className={styles.hiddenFileInput}
                  />
                  <Button
                    view="action"
                    size="l"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Выбрать файл
                  </Button>
                </label>
              </div>

              <div className={styles.avatarInfo}>
                <div className={styles.avatarContainer}>
                  {avatarPreview ? (
                    <Image
                      width={40}
                      height={40}
                      src={avatarPreview}
                      alt="Предварительный просмотр"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}></div>
                  )}
                </div>

                {selectedFileName && (
                  <div className={styles.fileInfo}>
                    <Text variant="caption-1">Файл: {selectedFileName}</Text>
                    <Button size="xs" onClick={handleDeleteFile}>
                      <Icon data={Xmark} size={10} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </FormField>

          <FormField error={errors.acceptTerms?.message}>
            <div className={styles.checkboxTerms}>
              <Checkbox
                {...register("acceptTerms", {
                  required: "Примите условия использования",
                })}
                checked={watchedFields.acceptTerms}
                size="l"
              ></Checkbox>
              <Text>
                Я принимаю{" "}
                <Button
                  onClick={() => setModalOpen(true)}
                  view="flat-info"
                  size="xs"
                >
                  условия использования
                </Button>
              </Text>
            </div>

            <TermsModal open={modalOpen} onClose={() => setModalOpen(false)} />
          </FormField>

          <Button
            type="submit"
            view="action"
            size="l"
            className={styles.button}
          >
            Зарегистрироваться
          </Button>

          <Button
            type="reset"
            view="outlined-warning"
            size="s"
            className={styles.resetButtons}
            onClick={handleResetForm}
          >
            Сбросить форму
          </Button>
        </form>
      </Card>
    </section>
  );
};
