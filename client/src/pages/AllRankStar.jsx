import { useEffect, useState } from "react";
import Wrapper from "../assets/wrappers/SearchContainer";
import customFetch from "../utils/customFetch.js";

const AllRankStar = () => {
  const [rankData, setRankData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(rankData.length / rowsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch.get("/users/alluser");
        // กรองเฉพาะคนที่มี physicalTherapy === true และเรียงลำดับจำนวนดาว
        const filteredData = response.data
          .filter((user) => user.physicalTherapy === true)
          .sort((a, b) => b.stars - a.stars); // เรียงจากมากไปน้อย

        setRankData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const currentData = rankData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col items-center space-y-8">
        {/* Header Section */}
        <div className="text-4xl font-bold text-center text-[#4cb3f4] mb-6">
          <span>🏆 จัดอันดับการทำกายภาพ 🏆</span>
        </div>

        {/* Leaderboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentData.map((item, index) => (
            <div
              key={item._id}
              className="bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white rounded-lg p-6 shadow-lg flex items-center justify-center"
            >
              <div className="flex flex-col items-center">
                {/* Rank Badge */}
                <div className="w-16 h-16 bg-white text-[#4cb3f4] rounded-full flex items-center justify-center font-bold text-2xl">
                  {index + 1 + (currentPage - 1) * rowsPerPage}
                </div>
                <div className="mt-4 text-lg font-medium">
                  {item.name} {item.surname}
                </div>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-yellow-400 text-xl font-bold">
                    {item.stars}
                  </span>
                  <span className="text-yellow-400 text-lg">⭐</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#4cb3f4] hover:bg-[#0072ff]"
            }`}
          >
            ก่อนหน้า
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-6 py-3 rounded-lg text-white font-semibold ${
                currentPage === index + 1
                  ? "bg-[#4cb3f4]"
                  : "bg-gray-200 text-gray-700 hover:bg-[#0072ff] transition-colors"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-6 py-3 rounded-lg text-white font-semibold ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#4cb3f4] hover:bg-[#0072ff]"
            }`}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

export default AllRankStar;
