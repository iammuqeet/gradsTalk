import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-black">
      /* From Uiverse.io by JkHuger */
      <div class="box-of-star1">
        <div class="star star-position1"></div>
        <div class="star star-position2"></div>
        <div class="star star-position3"></div>
        <div class="star star-position4"></div>
        <div class="star star-position5"></div>
        <div class="star star-position6"></div>
        <div class="star star-position7"></div>
      </div>
      <div class="box-of-star2">
        <div class="star star-position1"></div>
        <div class="star star-position2"></div>
        <div class="star star-position3"></div>
        <div class="star star-position4"></div>
        <div class="star star-position5"></div>
        <div class="star star-position6"></div>
        <div class="star star-position7"></div>
      </div>
      <div class="box-of-star3">
        <div class="star star-position1"></div>
        <div class="star star-position2"></div>
        <div class="star star-position3"></div>
        <div class="star star-position4"></div>
        <div class="star star-position5"></div>
        <div class="star star-position6"></div>
        <div class="star star-position7"></div>
      </div>
      <div class="box-of-star4">
        <div class="star star-position1"></div>
        <div class="star star-position2"></div>
        <div class="star star-position3"></div>
        <div class="star star-position4"></div>
        <div class="star star-position5"></div>
        <div class="star star-position6"></div>
        <div class="star star-position7"></div>
      </div>
      <div data-js="astro" class="astronaut">
        <div class="head"></div>
        <div class="arm arm-left"></div>
        <div class="arm arm-right"></div>
        <div class="body">
          <div class="panel"></div>
        </div>
        <div class="leg leg-left"></div>
        <div class="leg leg-right"></div>
        <div class="schoolbag"></div>
      </div>
      <h1 className="text-4xl font-bold text-white">404 - Page Not Found</h1>
      <p className="mt-4 text-white">
        Sorry, the page you are looking for does not exist.
      </p>
      <button
        onClick={handleRedirect}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-10"
      >
        Go to Home
      </button>
    </div>
  );
}

export default NotFound;
