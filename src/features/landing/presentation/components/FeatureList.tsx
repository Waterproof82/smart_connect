import React from "react";
import { useLanguage } from "../../../../shared/context/LanguageContext";
import { FaChartLine, FaStar, FaClock, FaUsers } from "react-icons/fa";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureList: React.FC = () => {
  const { t } = useLanguage();

  const features: Feature[] = [
    {
      icon: <FaChartLine className="text-blue-500" size={24} />,
      title: t.featuresSoftwareIA,
      description: t.featuresSoftwareIADesc,
    },
    {
      icon: <FaStar className="text-blue-500" size={24} />,
      title: t.featuresNFC,
      description: t.featuresNFCDesc,
    },
    {
      icon: <FaClock className="text-blue-500" size={24} />,
      title: t.featuresQribar,
      description: t.featuresQribarDesc,
    },
    {
      icon: <FaUsers className="text-blue-500" size={24} />,
      title: t.featuresAutomation,
      description: t.featuresAutomationDesc,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t.featuresTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureList;
