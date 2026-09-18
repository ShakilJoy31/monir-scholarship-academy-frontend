"use client";

const Card = () => {
  const cards = Array(6).fill(null); // 6 dummy cards

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 px-10 ">
      {cards.map((_, index) => (
        <div
          key={index}
          className="relative group border bg-white shadow-lg rounded-lg p-6 overflow-hidden h-52 flex flex-col justify-center items-center transition duration-300 hover:bg-[#035140] hover:text-white"
        >
          <h3 className="text-xl font-bold">BMSCR</h3>
          <p className="text-sm text-center mt-2">Successful Achievement Of Our Institute</p>

          {/* Hover Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300">
            <button className="bg-white text-[#035140] px-4 py-2 rounded font-semibold hover:bg-gray-200">
              Read More
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
