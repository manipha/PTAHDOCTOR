/* eslint-disable react-hooks/exhaustive-deps */
import { string } from "prop-types";
import Profile from "../../assets/images/user.png";
import { useEffect, useState } from "react";
import customFetch from "../../utils/customFetch";
import { toast } from "react-toastify";

export const PatientCard = ({ userId }) => {
    const [loading, setLoading] = useState(true);
    console.log("User ID:", userId);

    const [userModel, setUserModel] = useState({ patient: {} });

    const fetchDataUserById = async () => {
        try {
            const { data } = await customFetch.get(`/allusers/${userId}`);
            console.log("User Data:", data.patient);
            setUserModel(data.patient);
        } catch (error) {
            toast.error(error?.response?.data?.msg || "เกิดข้อผิดพลาดในการโหลดคำตอบ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchDataUserById();
        }
    }, [userId]);

    if (loading) {
        return <div className="text-center text-lg font-bold text-gray-600">กำลังโหลด...</div>;
    }


    return (
        <>
            <div className="w-full rounded-xl flex flex-row p-6 justify-between border-2 border-[#e6e6e6] shadow-lg bg-white">
                <div className="flex space-x-8">
                    <div className="w-20 h-20 mt-3">
                        <img src={Profile} alt="PtahApp" className="patient-image" />
                    </div>
                    <div className="flex flex-col space-y-2 text-gray-600 leading-[22px]">
                        <p className="font-bold text-gray-900">{userModel.name} {userModel.surname}</p>
                        <p className="font-light text-gray-900">เพศ : {userModel.gender}</p>
                        <p className="font-light text-gray-900">ดาวสะสม : {userModel.stars}⭐ </p>
                        <p className="font-light text-gray-900">เบอร์ติดต่อ : {userModel.tel}</p>
                    </div>

                </div>
            </div>
        </>
    );
};

PatientCard.propTypes = {
    userId: string,
};
