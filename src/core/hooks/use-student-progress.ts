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
};

export const useStudentProgress = (currentBelt?: BeltName | null): StudentProgress =>
  useMemo(() => {
    const belt = currentBelt ?? "Branca";

    // Mocked values for MVP; replace with attendance-based progress when available.
    const classesNeededGrade: number = 24;
    const classesThisGrade: number = 8;
    const totalClasses: number = 112;
    const classesRemaining = Math.max(classesNeededGrade - classesThisGrade, 0);
    const gradeProgress =
      classesNeededGrade === 0 ? 0 : classesThisGrade / classesNeededGrade;

    return {
      classesThisGrade,
      classesNeededGrade,
      classesRemaining,
      totalClasses,
      nextBelt: getNextBelt(belt),
      gradeProgress,
      totalProgress: Math.min(totalClasses / 200, 1),
    };
  }, [currentBelt]);
