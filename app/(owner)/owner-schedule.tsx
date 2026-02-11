import React, { useEffect, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { OwnerSidebar } from "../../components/owner/OwnerSidebar";
import { ClassList } from "../../components/owner/ClassList";
import { CreateClassModal } from "../../components/owner/CreateClassModal";
import { EditClassModal } from "../../components/owner/EditClassModal";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import { useAuthProfile } from "../../src/core/hooks/use-auth-profile";
import type { AcademyClass } from "../../src/core/ports/blackbelt-ports";
import { blackBeltAdapters } from "../../src/infra/supabase/adapters";
import { supabase } from "../../src/infra/supabase/client";

type InstructorOption = {
  value: string;
  label: string;
  name: string | null;
};

export default function OwnerSchedule() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768;

  const { academy, profileId, isLoading, error } = useOwnerAcademy();
  const { profile } = useAuthProfile();

  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<AcademyClass | null>(null);

  // Instructor options
  const [instructorOptions, setInstructorOptions] = useState<InstructorOption[]>([]);
  const [isInstructorsLoading, setIsInstructorsLoading] = useState(false);

  // Load instructors
  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadInstructors = async () => {
      setIsInstructorsLoading(true);
      try {
        type StaffRole = "owner" | "professor";
        type StaffRow = {
          user_id: string;
          role: StaffRole;
          profiles: { full_name: string | null; email: string | null } | null;
        };

        const { data, error } = await supabase
          .from("academy_staff")
          .select("user_id, role, profiles:profiles (full_name, email)")
          .eq("academy_id", academy.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const rows = (data as StaffRow[] | null) ?? [];
        const options = rows.map((row) => {
          const name = row.profiles?.full_name ?? null;
          const email = row.profiles?.email ?? null;
          const labelBase = name ?? email ?? row.user_id.slice(0, 8);
          const label = row.role === "owner" ? `${labelBase} (Mestre)` : `${labelBase} (Professor)`;
          return { value: row.user_id, label, name: name ?? email };
        });

        if (!isActive) return;
        setInstructorOptions(options);
      } catch {
        if (!isActive) return;
        setInstructorOptions([]);
      } finally {
        if (isActive) setIsInstructorsLoading(false);
      }
    };

    void loadInstructors();

    return () => {
      isActive = false;
    };
  }, [academy]);

  // Load classes
  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadClasses = async () => {
      setIsClassesLoading(true);
      setLocalError(null);
      try {
        const list = await blackBeltAdapters.classes.listByAcademy(academy.id);
        if (!isActive) return;
        setClasses(list);
      } catch (err) {
        if (!isActive) return;
        setLocalError(
          err instanceof Error ? err.message : "Não foi possível carregar a agenda."
        );
      } finally {
        if (isActive) setIsClassesLoading(false);
      }
    };

    void loadClasses();

    return () => {
      isActive = false;
    };
  }, [academy]);

  // Handle create class
  const handleCreateClass = async (data: {
    title: string;
    weekday: number;
    start_time: string;
    end_time: string;
    instructor_id?: string | null;
    instructor_name?: string;
    location?: string;
    level?: string;
    notes?: string;
    is_recurring?: boolean;
    start_date?: string;
  }) => {
    if (!academy) throw new Error("Academia não encontrada");

    const created = await blackBeltAdapters.classes.createClass({
      academyId: academy.id,
      title: data.title,
      instructorId: data.instructor_id ?? profileId ?? null,
      instructorName: data.instructor_name ?? null,
      weekday: data.weekday,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location ?? null,
      level: data.level ?? null,
      notes: data.notes ?? null,
      isRecurring: data.is_recurring ?? true,
      startDate: data.start_date ?? null,
    });

    setClasses((prev) => [...prev, created]);
  };

  // Handle update class
  const handleUpdateClass = async (
    id: string,
    data: {
      title: string;
      weekday: number;
      start_time: string;
      end_time: string;
      instructor_id?: string | null;
      instructor_name?: string;
      location?: string;
      level?: string;
      notes?: string;
      is_recurring?: boolean;
      start_date?: string;
    }
  ) => {
    const updated = await blackBeltAdapters.classes.updateClass({
      id,
      title: data.title,
      instructorId: data.instructor_id ?? profileId ?? null,
      instructorName: data.instructor_name ?? null,
      weekday: data.weekday,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location ?? null,
      level: data.level ?? null,
      notes: data.notes ?? null,
      isRecurring: data.is_recurring ?? true,
      startDate: data.start_date ?? null,
    });

    setClasses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  // Handle delete class
  const handleDeleteClass = async (item: AcademyClass) => {
    await blackBeltAdapters.classes.deleteClass(item.id);
    setClasses((prev) => prev.filter((entry) => entry.id !== item.id));
  };

  // Handle edit click
  const handleEditClick = (item: AcademyClass) => {
    setEditingClass(item);
  };

  // Handle delete click (from ClassCard)
  const handleDeleteClick = (item: AcademyClass) => {
    // Open edit modal so user can see the delete button
    setEditingClass(item);
  };

  const totalClasses = classes.length;

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1200px]">
          {/* Desktop: Two column layout */}
          <View className={isDesktop ? "flex-row gap-8" : ""}>
            {/* Sidebar - Desktop only */}
            {isDesktop ? (
              <View className="w-72">
                <OwnerSidebar profile={profile} academy={academy} />
              </View>
            ) : null}

            {/* Main Content */}
            <View className="flex-1">
              {/* Header */}
              <View
                className={
                  isTablet
                    ? "flex-row items-start justify-between gap-4"
                    : "gap-3"
                }
              >
                <View>
                  <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                    Agenda
                  </Text>
                  <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
                    Grade de aulas
                  </Text>
                  <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                    Gerencie as aulas da sua academia
                  </Text>
                </View>

                <Button
                  label="➕ Nova Aula"
                  onPress={() => setIsCreateModalOpen(true)}
                  size="md"
                  className={isTablet ? "" : "self-start"}
                />
              </View>

              {/* Error Messages */}
              {error ? (
                <Card className="mt-6" variant="outline">
                  <Text className="text-sm text-red-500">{error}</Text>
                </Card>
              ) : null}
              {localError ? (
                <Card className="mt-6" variant="outline">
                  <Text className="text-sm text-red-500">{localError}</Text>
                </Card>
              ) : null}

              {/* Quick Stats */}
              <View className={isTablet ? "mt-6 flex-row gap-4" : "mt-6 gap-3"}>
                <Card className={isTablet ? "flex-1" : ""} variant="outline">
                  <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
                    Total de aulas
                  </Text>
                  <Text className="mt-1 font-display text-2xl text-strong-light dark:text-strong-dark">
                    {totalClasses}
                  </Text>
                </Card>
                <Card className={isTablet ? "flex-1" : ""} variant="outline">
                  <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
                    Professores
                  </Text>
                  <Text className="mt-1 font-display text-2xl text-strong-light dark:text-strong-dark">
                    {instructorOptions.length}
                  </Text>
                </Card>
              </View>

              {/* Class List */}
              <ClassList
                classes={classes}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isLoading={isLoading || isClassesLoading}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Create Modal */}
      <CreateClassModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClass}
        instructorOptions={instructorOptions}
        defaultInstructorId={profileId}
        isInstructorsLoading={isInstructorsLoading}
      />

      {/* Edit Modal */}
      <EditClassModal
        visible={editingClass !== null}
        classItem={editingClass}
        onClose={() => setEditingClass(null)}
        onSubmit={handleUpdateClass}
        onDelete={handleDeleteClass}
        instructorOptions={instructorOptions}
        isInstructorsLoading={isInstructorsLoading}
      />
    </ScrollView>
  );
}
