import React from "react";

const TrustBadges: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Trusted By</h2>
      <div className="flex flex-wrap justify-center gap-6">
        <img
          src="/images/google-partner.png"
          alt="Google Partner"
          className="h-12"
        />
        <img
          src="/images/facebook-verified.png"
          alt="Facebook Verified"
          className="h-12"
        />
        <img
          src="/images/yelp-certified.png"
          alt="Yelp Certified"
          className="h-12"
        />
      </div>
    </div>
  );
};

export default TrustBadges;
