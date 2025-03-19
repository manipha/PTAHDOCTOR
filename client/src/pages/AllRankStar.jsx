import { useEffect, useState } from "react";
import Wrapper from "../assets/wrappers/SearchContainer";
import customFetch from "../utils/customFetch.js";

// นำเข้ารูปถ้วยรางวัลสำหรับอันดับที่ 1, 2, 3
import trophy1 from "../assets/images/trophy1.png";
import trophy2 from "../assets/images/trophy2.png";
import trophy3 from "../assets/images/trophy3.png";

const AllRankStar = () => {
  const [rankData, setRankData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch.get("/users/alluser");
        // กรองเฉพาะคนที่มี physicalTherapy === true
        // แล้วเรียงลำดับดาวจากมากไปน้อย (ใช้ parseInt เพื่อแปลงค่า stars ให้เป็นตัวเลข)
        const filteredData = response.data
          .filter((user) => user.physicalTherapy === true)
          .sort((a, b) => {
            const starsA = a.stars ? parseInt(a.stars, 10) : 0;
            const starsB = b.stars ? parseInt(b.stars, 10) : 0;
            return starsB - starsA;
          });

        console.log("Sorted Data:", JSON.stringify(filteredData, null, 2));
        setRankData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // แบ่งข้อมูลเป็น Top 3 และอันดับที่ 4 ขึ้นไป
  const topThree = rankData.slice(0, 3);
  const rest = rankData.slice(3);

  // ตรวจสอบว่าใน topThree มีข้อมูลเพียงพอหรือไม่ เพื่อป้องกัน error
  const firstPlace = topThree[0];
  const secondPlace = topThree[1];
  const thirdPlace = topThree[2];

  // ฟังก์ชันแสดงบล็อคผู้ใช้งาน พร้อมรูปถ้วยและจำนวนดาว
  // ใช้ prop bgColor สำหรับกำหนดสีพื้นหลังแบบปกติ
  const PodiumBlock = ({ user, trophy, starsTransform = "", bgColor }) => {
    if (!user) return null; // ถ้าไม่มีข้อมูล

    // ถ้าไม่มี stars หรือค่าเป็น falsy ให้แสดงเป็น 0
    const displayStars = user.stars ? user.stars : 0;

    return (
      <div
        className={`w-60 h-50 flex flex-col items-center justify-center p-4 transform ${starsTransform} rounded-lg ${bgColor} shadow-lg`}
      >
        {/* ปรับปรุงรูปถ้วย trophy ให้เด่นขึ้น โดยเพิ่ม margin-bottom เพื่อให้ไม่แอดอัด */}
        <div className="w-32 h-32 mb-6">
          <img
            src={trophy}
            alt="Trophy"
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
        {/* ชื่อ */}
        <div className="text-lg font-semibold text-gray-800 text-center">
          {user.name} {user.surname}
        </div>
        {/* แสดงดาว ถ้า > 0 */}
        <div className="flex items-center mt-2 space-x-1">
          {Number(displayStars) > 0 ? (
            <>
              <span className="text-yellow-400 text-xl">⭐</span>
              <span className="text-yellow-400 text-xl font-bold">{displayStars}</span>
              <span className="text-yellow-400 text-xl">⭐</span>
            </>
          ) : (
            <span className="text-gray-500 text-xl font-bold">{displayStars}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#87CEFA] mb-10 mt-[-30px]">
          จัดอันดับการทำกายภาพ
        </h2>

        {/* Top 3 Section แบบ Podium (ลดหลั่น) */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-end gap-4 mb-12">
          {/* อันดับ 2 (ซ้าย) */}
          <PodiumBlock
            user={secondPlace}
            trophy={trophy2}
            starsTransform="translate-y-4"
            bgColor="bg-[#eceff1a3]"
          />

          {/* อันดับ 1 (กลาง) */}
          <PodiumBlock
            user={firstPlace}
            trophy={trophy1}
            starsTransform="-translate-y-4"
            bgColor="bg-[#fff9c4]"
          />

          {/* อันดับ 3 (ขวา) */}
          <PodiumBlock
            user={thirdPlace}
            trophy={trophy3}
            starsTransform="translate-y-4"
            bgColor="bg-[#ffe0b282]"
          />
        </div>

        {/* List Section สำหรับอันดับที่ 4 ขึ้นไป */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="table-fixed w-full text-center">
            <thead className="bg-[#87CEFA]">
              <tr>
                <th className="w-1/3 py-3 px-4 font-semibold text-gray-100">อันดับ</th>
                <th className="w-1/3 py-3 px-4 font-semibold text-gray-100">ชื่อ</th>
                <th className="w-1/3 py-3 px-4 font-semibold text-gray-100">ดาว</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rest.map((item, index) => {
                // ถ้าไม่มี stars ให้แสดงเป็น 0
                const displayStars = item.stars ? item.stars : 0;
                return (
                  <tr key={item._id}>
                    <td className="py-3 px-4 text-gray-700 font-medium">{index + 4}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {item.name} {item.surname}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {Number(displayStars) > 0 ? (
                        <>
                          <span className="text-yellow-500 font-bold mr-1">{displayStars}</span>
                          <span className="text-yellow-500">⭐</span>
                        </>
                      ) : (
                        <span className="text-gray-500 font-bold">{displayStars}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Wrapper>
  );
};

export default AllRankStar;
