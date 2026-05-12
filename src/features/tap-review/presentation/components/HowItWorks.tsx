import React from "react";

const HowItWorks: React.FC = () => {
  return (
    <div className="bg-gray-100 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
          <h3 className="text-xl font-semibold mb-2">Scan the QR Code</h3>
          <p className="text-gray-600">
            Use your smartphone to scan the QR code on your menu.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl font-bold text-blue-600 mb-4">2</div>
          <h3 className="text-xl font-semibold mb-2">Rate Your Experience</h3>
          <p className="text-gray-600">
            Leave your feedback with a simple star rating.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-4xl font-bold text-blue-600 mb-4">3</div>
          <h3 className="text-xl font-semibold mb-2">Get Rewarded</h3>
          <p className="text-gray-600">
            Earn points and exclusive offers for your feedback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
