import { useMemo } from "react";

import type { BeltName } from "../belts/belts";
import { getNextBelt } from "../belts/belts";

type StudentProgress = {
  classesThisGrade: number;
  classesNeededGrade: number;
  classesRemaining: number;
  totalClasses: number;
  nextBelt: BeltName;
  gradeProgress: number;
  totalProgress: number;
  isLoading: boolean;
};

const CLASSES_PER_GRADE = 24;
const TOTAL_CLASSES_TARGET = 200;

/**
 * Now reads approved_classes directly from the AcademyMember record
 * instead of a separate student_progress table.
 */
export const useStudentProgress = (
  currentBelt: BeltName | null | undefined,
  approvedClasses: number | undefined
): StudentProgress => {
  return useMemo(() => {
    const belt = currentBelt ?? "Branca";
    const count = approvedClasses ?? 0;
    const classesThisGrade = count % CLASSES_PER_GRADE;
    const classesRemaining = Math.max(CLASSES_PER_GRADE - classesThisGrade, 0);
    const gradeProgress = classesThisGrade / CLASSES_PER_GRADE;

    return {
      classesThisGrade,
      classesNeededGrade: CLASSES_PER_GRADE,
      classesRemaining,
      totalClasses: count,
      nextBelt: getNextBelt(belt),
      gradeProgress,
      totalProgress: Math.min(count / TOTAL_CLASSES_TARGET, 1),
      isLoading: false,
    };
  }, [currentBelt, approvedClasses]);
};
