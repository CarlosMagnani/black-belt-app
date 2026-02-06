import { useCallback, useEffect, useMemo, useState } from "react";

import type { BeltName } from "../belts/belts";
import { getNextBelt } from "../belts/belts";
import { dojoFlowAdapters } from "../../infra/supabase/adapters";

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

export const useStudentProgress = (
  currentBelt: BeltName | null | undefined,
  studentId: string | null | undefined
): StudentProgress => {
  const [approvedCount, setApprovedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadProgress = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    try {
      const data = await dojoFlowAdapters.progress.getByStudent(studentId);
      setApprovedCount(data?.approvedClassesCount ?? 0);
    } catch {
      // Fallback to 0 on error
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  return useMemo(() => {
    const belt = currentBelt ?? "Branca";
    const classesThisGrade = approvedCount % CLASSES_PER_GRADE;
    const classesRemaining = Math.max(CLASSES_PER_GRADE - classesThisGrade, 0);
    const gradeProgress = classesThisGrade / CLASSES_PER_GRADE;

    return {
      classesThisGrade,
      classesNeededGrade: CLASSES_PER_GRADE,
      classesRemaining,
      totalClasses: approvedCount,
      nextBelt: getNextBelt(belt),
      gradeProgress,
      totalProgress: Math.min(approvedCount / TOTAL_CLASSES_TARGET, 1),
      isLoading,
    };
  }, [currentBelt, approvedCount, isLoading]);
};
