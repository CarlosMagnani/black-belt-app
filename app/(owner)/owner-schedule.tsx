import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { DayChips } from "../../components/home/DayChips";
import { ClassCard } from "../../components/owner/ClassCard";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";
import { useOwnerAcademy } from "../../src/core/hooks/use-owner-academy";
import type { AcademyClass } from "../../src/core/ports/dojoflow-ports";
import { dojoFlowAdapters } from "../../src/infra/supabase/adapters";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export default function OwnerSchedule() {
  const { academy, isLoading, error } = useOwnerAcademy();
  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [isClassesLoading, setIsClassesLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [weekday, setWeekday] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [startDate, setStartDate] = useState("");

  const dayOptions = useMemo(
    () => WEEKDAY_LABELS.map((label, value) => ({ label, value })),
    []
  );

  useEffect(() => {
    if (!academy) return;
    let isActive = true;

    const loadClasses = async () => {
      setIsClassesLoading(true);
      setLocalError(null);
      try {
        const list = await dojoFlowAdapters.classes.listByAcademy(academy.id);
        if (!isActive) return;
        setClasses(list);
      } catch (err) {
        if (!isActive) return;
        setLocalError(err instanceof Error ? err.message : "Nao foi possivel carregar a agenda.");
      } finally {
        if (isActive) setIsClassesLoading(false);
      }
    };

    void loadClasses();

    return () => {
      isActive = false;
    };
  }, [academy]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setInstructorName("");
    setWeekday(1);
    setStartTime("");
    setEndTime("");
    setLocation("");
    setLevel("");
    setNotes("");
    setIsRecurring(true);
    setStartDate("");
  };

  const handleEdit = (item: AcademyClass) => {
    setEditingId(item.id);
    setTitle(item.title);
    setInstructorName(item.instructorName ?? "");
    setWeekday(item.weekday);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setLocation(item.location ?? "");
    setLevel(item.level ?? "");
    setNotes(item.notes ?? "");
    setIsRecurring(item.isRecurring);
    setStartDate(item.startDate ?? "");
  };

  const handleDelete = async (item: AcademyClass) => {
    setIsSaving(true);
    setLocalError(null);
    try {
      await dojoFlowAdapters.classes.deleteClass(item.id);
      setClasses((prev) => prev.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel remover a aula.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!academy) return;
    if (!title.trim() || !startTime.trim() || !endTime.trim()) {
      setLocalError("Preencha titulo e horario.");
      return;
    }
    setIsSaving(true);
    setLocalError(null);
    try {
      if (editingId) {
        const updated = await dojoFlowAdapters.classes.updateClass({
          id: editingId,
          title: title.trim(),
          instructorName: instructorName.trim() || null,
          weekday,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          location: location.trim() || null,
          level: level.trim() || null,
          notes: notes.trim() || null,
          isRecurring,
          startDate: startDate.trim() || null,
        });
        setClasses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await dojoFlowAdapters.classes.createClass({
          academyId: academy.id,
          title: title.trim(),
          instructorName: instructorName.trim() || null,
          weekday,
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          location: location.trim() || null,
          level: level.trim() || null,
          notes: notes.trim() || null,
          isRecurring,
          startDate: startDate.trim() || null,
        });
        setClasses((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Nao foi possivel salvar a aula.");
    } finally {
      setIsSaving(false);
    }
  };

  const sorted = useMemo(() => {
    return [...classes].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [classes]);

  return (
    <ScrollView className="flex-1">
      <View className="px-page pb-10 pt-6 web:px-10">
        <View className="mx-auto w-full max-w-[1100px]">
          <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
            Agenda
          </Text>
          <Text className="mt-2 font-display text-3xl text-strong-light dark:text-strong-dark">
            Grade de aulas
          </Text>
          <Text className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Cadastre aulas recorrentes ou avulsas.
          </Text>

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

          <Card className="mt-6 gap-4">
            <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
              {editingId ? "Editar aula" : "Nova aula"}
            </Text>

            <TextField
              label="Titulo"
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Jiu-Jitsu NoGi"
            />
            <TextField
              label="Instrutor"
              value={instructorName}
              onChangeText={setInstructorName}
              placeholder="Opcional"
            />

            <View>
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Dia da semana
              </Text>
              <DayChips days={dayOptions} selected={weekday} onSelect={setWeekday} />
            </View>

            <View className="gap-3 web:flex-row">
              <TextField
                label="Inicio"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="19:00"
              />
              <TextField
                label="Fim"
                value={endTime}
                onChangeText={setEndTime}
                placeholder="20:30"
              />
            </View>

            <View className="gap-3 web:flex-row">
              <TextField
                label="Local"
                value={location}
                onChangeText={setLocation}
                placeholder="Tatame 1"
              />
              <TextField
                label="Nivel"
                value={level}
                onChangeText={setLevel}
                placeholder="Iniciante"
              />
            </View>

            <TextField
              label="Notas"
              value={notes}
              onChangeText={setNotes}
              placeholder="Observacoes"
            />

            <View className="gap-2">
              <Text className="text-xs uppercase tracking-[3px] text-muted-light dark:text-muted-dark">
                Recorrencia
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
                  label="Aula unica"
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
                />
              ) : null}
            </View>

            <View className="flex-row gap-2">
              <Button
                label={isSaving ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
                onPress={handleSubmit}
                disabled={isSaving}
                className="flex-1"
              />
              {editingId ? (
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={resetForm}
                  disabled={isSaving}
                  className="flex-1"
                />
              ) : null}
            </View>
          </Card>

          {isLoading || isClassesLoading ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Carregando aulas...
              </Text>
            </Card>
          ) : sorted.length === 0 ? (
            <Card className="mt-6">
              <Text className="text-sm text-muted-light dark:text-muted-dark">
                Nenhuma aula cadastrada.
              </Text>
            </Card>
          ) : (
            <View className="mt-6 gap-4">
              {sorted.map((item) => (
                <ClassCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
