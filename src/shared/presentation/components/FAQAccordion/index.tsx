import React, { useState } from "react";

export interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  title?: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  title = "Preguntas Frecuentes",
}) => {
  const [open, setOpen] = useState<string | number | null>(null);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container max-w-4xl px-6 py-10 mx-auto">
        <h1 className="text-2xl font-semibold text-center text-gray-800 lg:text-3xl dark:text-white">
          {title}
        </h1>

        <div className="mt-12 space-y-8">
          {items.map((item) => (
            <details
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg"
              open={open === item.id}
              onClick={(e) => {
                e.preventDefault();
                setOpen(open === item.id ? null : item.id);
              }}
            >
              <summary className="flex items-center justify-between w-full p-8 cursor-pointer">
                <h1 className="font-semibold text-gray-700 dark:text-white">
                  {item.question}
                </h1>
                <span className="text-gray-400 bg-gray-200 rounded-full dark:bg-gray-800">
                  {/* Basic +/- indicator */}
                  {open === item.id ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </span>
              </summary>
              <div className="p-8 -mt-8">
                <p className="text-gray-500 dark:text-gray-300">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
