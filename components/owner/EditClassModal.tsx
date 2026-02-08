import React, { useEffect, useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { z } from "zod";

import type { AcademyClass } from "../../src/core/ports/blackbelt-ports";
import { Modal } from "../ui/Modal";
import { TextField } from "../ui/TextField";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { DayChips } from "../home/DayChips";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const classSchema = z.object({
  title: z.string().min(3, "Nome muito curto (mínimo 3 caracteres)"),
  weekday: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  instructor_id: z.string().nullable().optional(),
  instructor_name: z.string().optional(),
  location: z.string().optional(),
  level: z.string().optional(),
  notes: z.string().optional(),
  is_recurring: z.boolean().default(true),
  start_date: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

type InstructorOption = {
  value: string;
  label: string;
  name: string | null;
};

type EditClassModalProps = {
  visible: boolean;
  classItem: AcademyClass | null;
  onClose: () => void;
  onSubmit: (id: string, data: ClassFormData) => Promise<void>;
  onDelete: (item: AcademyClass) => Promise<void>;
  instructorOptions: InstructorOption[];
  isInstructorsLoading?: boolean;
};

type FormErrors = Partial<Record<keyof ClassFormData, string>>;

export function EditClassModal({
  visible,
  classItem,
  onClose,
  onSubmit,
  onDelete,
  instructorOptions,
  isInstructorsLoading,
}: EditClassModalProps) {
  const [title, setTitle] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [instructorName, setInstructorName] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [startDate, setStartDate] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dayOptions = WEEKDAY_LABELS.map((label, value) => ({ label, value }));

  // Populate form when classItem changes
  useEffect(() => {
    if (visible && classItem) {
      setTitle(classItem.title);
      setWeekday(classItem.weekday);
      setStartTime(classItem.startTime);
      setEndTime(classItem.endTime);
      setInstructorId(classItem.instructorId ?? null);
      setInstructorName(classItem.instructorName ?? "");
      setLocation(classItem.location ?? "");
      setLevel(classItem.level ?? "");
      setNotes(classItem.notes ?? "");
      setIsRecurring(classItem.isRecurring);
      setStartDate(classItem.startDate ?? "");
      setErrors({});
      setSubmitError(null);
    }
  }, [visible, classItem]);

  const validateForm = (): boolean => {
    const formData = {
      title: title.trim(),
      weekday,
      start_time: startTime.trim(),
      end_time: endTime.trim(),
      instructor_id: instructorId,
      instructor_name: instructorName.trim(),
      location: location.trim(),
      level: level.trim(),
      notes: notes.trim(),
      is_recurring: isRecurring,
      start_date: startDate.trim(),
    };

    const result = classSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ClassFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    // Additional validation: start time must be before end time
    if (formData.start_time >= formData.end_time) {
      setErrors({ start_time: "Horário de início deve ser antes do fim" });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!classItem || !validateForm()) return;

    setIsSaving(true);
    setSubmitError(null);

    try {
      await onSubmit(classItem.id, {
        title: title.trim(),
        weekday,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        instructor_id: instructorId,
        instructor_name: instructorName.trim() || undefined,
        location: location.trim() || undefined,
        level: level.trim() || undefined,
        notes: notes.trim() || undefined,
        is_recurring: isRecurring,
        start_date: startDate.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Não foi possível salvar a aula."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!classItem) return;

    setIsDeleting(true);
    setSubmitError(null);

    try {
      await onDelete(classItem);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Não foi possível remover a aula."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = () => {
    if (!classItem) return;

    if (Platform.OS === "web") {
      if (window.confirm(`Remover a aula "${classItem.title}"?`)) {
        void confirmDelete();
      }
    } else {
      Alert.alert(
        "Remover aula",
        `Deseja remover a aula "${classItem.title}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Remover", style: "destructive", onPress: () => void confirmDelete() },
        ]
      );
    }
  };

  const isBusy = isSaving || isDeleting;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="✏️ Editar Aula"
      maxWidth="md"
    >
      <View className="gap-4">
        <TextField
          label="Nome da aula"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Jiu-Jitsu NoGi"
          errorMessage={errors.title}
        />

        <View>
          <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
            Dia da semana
          </Text>
          <DayChips days={dayOptions} selected={weekday} onSelect={setWeekday} />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Início"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="19:00"
              errorMessage={errors.start_time}
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Fim"
              value={endTime}
              onChangeText={setEndTime}
              placeholder="20:30"
              errorMessage={errors.end_time}
            />
          </View>
        </View>

        <Select
          label="Professor"
          placeholder={isInstructorsLoading ? "Carregando..." : "Selecione..."}
          value={instructorId ?? undefined}
          options={instructorOptions.map((opt) => ({
            label: opt.label,
            value: opt.value,
          }))}
          onValueChange={(value) => {
            setInstructorId(value);
            const selected = instructorOptions.find((opt) => opt.value === value);
            if (selected?.name) setInstructorName(selected.name);
          }}
        />

        <TextField
          label="Nome do professor (exibição)"
          value={instructorName}
          onChangeText={setInstructorName}
          placeholder="Ex: Professor Carlos"
          helperText="Nome que aparecerá para os alunos"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <TextField
              label="Local"
              value={location}
              onChangeText={setLocation}
              placeholder="Tatame 1"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Nível"
              value={level}
              onChangeText={setLevel}
              placeholder="Iniciante"
            />
          </View>
        </View>

        <TextField
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          placeholder="Observações adicionais"
          multiline
        />

        <View className="gap-2">
          <Text className="text-xs uppercase tracking-widest text-muted-light dark:text-muted-dark">
            Recorrência
          </Text>
          <View className="flex-row gap-2">
            <Button
              label="Recorrente"
              variant={isRecurring ? "primary" : "secondary"}
              size="sm"
              onPress={() => setIsRecurring(true)}
              className="flex-1"
            />
            <Button
              label="Aula única"
              variant={!isRecurring ? "primary" : "secondary"}
              size="sm"
              onPress={() => setIsRecurring(false)}
              className="flex-1"
            />
          </View>
          {!isRecurring ? (
            <TextField
              label="Data da aula"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="AAAA-MM-DD"
              helperText="Formato: ano-mês-dia"
            />
          ) : null}
        </View>

        {submitError ? (
          <View className="rounded-lg bg-red-500/10 p-3">
            <Text className="text-sm text-red-400">{submitError}</Text>
          </View>
        ) : null}

        <View className="mt-2 gap-2">
          <View className="flex-row gap-2">
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={onClose}
              disabled={isBusy}
              className="flex-1"
            />
            <Button
              label={isSaving ? "Salvando..." : "Salvar"}
              onPress={handleSubmit}
              disabled={isBusy}
              className="flex-1"
            />
          </View>
          <Button
            label={isDeleting ? "Removendo..." : "🗑️ Remover Aula"}
            variant="ghost"
            onPress={handleDelete}
            disabled={isBusy}
            textClassName="text-red-400"
          />
        </View>
      </View>
    </Modal>
  );
}
