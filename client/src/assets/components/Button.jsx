import { AiFillLike, AiFillDislike } from "react-icons/ai";

export const LikeButton = ({ isDisable = false, isActive, handleClick }) => {
    return (
        <button
            className={`w-full flex justify-center items-center p-2 rounded-3xl space-x-2 ${
                isActive
                    ? "bg-[#29CE43]"
                    : "bg-[#DDFEE3] border-2 border-[#1DD047]"
            } ${isDisable ? "cursor-not-allowed" : ""}`}
            onClick={handleClick}
            disabled={isDisable}
        >
            <span className="text-2xl">
                <AiFillLike
                    className={`${isActive ? "text-white" : "text-[#1DD047]"}`}
                />
            </span>
            <span className={`${isActive ? "text-white" : "text-[#1DD047]"}`}>
                ทำได้ดี
            </span>
        </button>
    );
};

export const DislikeButton = ({ isDisable = false, isActive, handleClick }) => {
    return (
      <button
        className={`w-full flex justify-center items-center p-2 rounded-3xl space-x-2 ${
          isActive ? "bg-[#F2AA3D]" : "bg-[#FBF0DA] border-2 border-[#F2AA3D]"
        } ${isDisable ? "cursor-not-allowed" : ""}`}
        onClick={handleClick}
        disabled={isDisable}
      >
        <span className="text-2xl">
          <AiFillDislike
            className={`${isActive ? "text-white" : "text-[#F4AE46]"}`}
          />
        </span>
        <span className={`${isActive ? "text-white" : "text-[#ff9d0a]"}`}>
          ควรปรับปรุง
        </span>
      </button>
    );
};
