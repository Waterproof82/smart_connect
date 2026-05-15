import React from "react";
import { useLanguage } from "../../../../shared/context/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ContactForm: React.FC = () => {
  const { t } = useLanguage();

  const schema = z.object({
    name: z.string().min(1, t.contactFormNameRequired),
    company: z.string().min(1, t.contactFormCompanyRequired),
    email: z.string().email(t.contactFormEmailInvalid),
    service: z.string().min(1, t.contactFormServiceRequired),
    message: z.string().min(10, t.contactFormMessageMinLength),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // TODO: Implement form submission logic
    console.log(data);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t.contactTitle}
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {t.contactSubtitle}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto">
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.contactFormName}
            </label>
            <input
              id="name"
              {...register("name")}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
              placeholder={t.contactPlaceholderName}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.contactFormCompany}
            </label>
            <input
              id="company"
              {...register("company")}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.company ? "border-red-500" : "border-gray-300"}`}
              placeholder={t.contactPlaceholderCompany}
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">
                {errors.company.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.contactFormEmail}
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
              placeholder={t.contactPlaceholderEmail}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.contactFormService}
            </label>
            <select
              id="service"
              {...register("service")}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.service ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">{t.contactSelectOption}</option>
              <option value="carta-digital">{t.serviceCartaDigital}</option>
              <option value="qribar">{t.serviceQribar}</option>
              <option value="automation">{t.serviceAutomation}</option>
              <option value="nfc">{t.serviceNFC}</option>
              <option value="consultoria">{t.serviceConsultoria}</option>
            </select>
            {errors.service && (
              <p className="mt-1 text-sm text-red-600">
                {errors.service.message}
              </p>
            )}
          </div>

          <div className="mb-8">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t.contactFormMessage}
            </label>
            <textarea
              id="message"
              {...register("message")}
              rows={4}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.message ? "border-red-500" : "border-gray-300"}`}
              placeholder={t.contactPlaceholderMessage}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.message.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t.contactFormSending : t.contactFormSubmit}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
