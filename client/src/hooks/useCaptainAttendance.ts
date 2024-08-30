import { useState, useEffect } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

import {
  useGetUnitAttendanceQuery,
  useUpsertUnitAttendanceMutation,
} from "../redux/slices/attendanceApiSlice";

export const useCaptainAttendance = (chosenWeek) => {
  const [attendance, setAttendance] = useState([]);
  const user: { captainId: number } = useAuthUser();

  const {
    data: captains,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetUnitAttendanceQuery(
    {
      unitCaptainId: user.captainId,
      weekNumber: parseInt(chosenWeek),
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !chosenWeek,
    },
  );

  const [upsertAttendance, { isLoading: isLoadingUpsertAttendance }] =
    useUpsertUnitAttendanceMutation();

  useEffect(() => {
    if (isSuccess && !isLoading && !isFetching && captains) {
      const formattedCaptains = captains.map((captain) => ({
        ...captain,
        present: captain?.attendanceStatus === "attended",
        excused: captain?.attendanceStatus === "execused",
        id: captain.captainId,
        name: `${captain.firstName} ${captain.middleName} ${captain.lastName}`,
      }));
      setAttendance(formattedCaptains);
    }
  }, [isSuccess, isLoading, isFetching, chosenWeek, captains]);

  return {
    attendance,
    setAttendance,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
    upsertAttendance,
    isLoadingUpsertAttendance,
  };
};