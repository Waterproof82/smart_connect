import React from "react";

interface StatsBannerProps {
  reviews?: number;
  ratings?: number;
  averageRating?: number;
}

const StatsBanner: React.FC<StatsBannerProps> = ({
  reviews = 600000,
  ratings = 400,
  averageRating = 4.9,
}) => {
  return (
    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
      <div className="flex flex-wrap justify-around">
        <div className="text-center">
          <div className="text-3xl font-bold">{reviews.toLocaleString()}</div>
          <div className="text-sm">Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{ratings.toLocaleString()}</div>
          <div className="text-sm">Ratings</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="text-sm">Average Rating</div>
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;
