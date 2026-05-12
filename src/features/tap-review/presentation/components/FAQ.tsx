import React from "react";

interface FAQProps {
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

const FAQ: React.FC<FAQProps> = ({
  faqs = [
    {
      question: "¿Funciona con cualquier móvil?",
      answer: "Sí, con cualquier móvil con NFC (iPhone y Android)",
    },
    {
      question: "¿Necesito internet?",
      answer: "Solo para abrir Google Reviews, el NFC funciona sin conexión",
    },
    {
      question: "¿Es difícil de instalar?",
      answer: "No, solo necesitas pegar el código QR y listo",
    },
  ],
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
