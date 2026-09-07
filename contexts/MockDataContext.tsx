"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lesson = {
  id: string | number;
  lessonId?: string;
  title: string;
  status: "locked" | "in-progress" | "completed";
  content: string;
  type: string;
  description?: string;
  materials?: any[];
};

export type Course = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  disasterType?: string;
  iconName: string;
  duration: string;
  estimatedDuration?: string;
  progress: number;
  difficulty?: string;
  published?: boolean;
  lessons: Lesson[];
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type Quiz = {
  slug: string;
  title: string;
  category: string;
  questions: Question[];
  difficulty: "Easy" | "Medium" | "Hard";
};

export type QuizAttempt = {
  id: string;
  quizSlug: string;
  quizTitle: string;
  score: number;
  total: number;
  date: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: "High" | "Medium" | "Low";
  date: string;
  read: boolean;
};

export type StudentProfile = {
  name: string;
  email: string;
  avatar?: string;
  preparednessScore: number;
  certificates: number;
};

type DataContextType = {
  courses: Course[];
  quizzes: Quiz[];
  alerts: Alert[];
  profile: StudentProfile;
  quizAttempts: QuizAttempt[];
  isLoading: boolean;
  markLessonComplete: (courseSlug: string, lessonId: string | number) => Promise<void>;
  submitQuiz: (quizSlug: string, score: number, total: number, answers?: any) => Promise<string>;
  markAlertRead: (alertId: string) => Promise<void>;
  updateProfile: (name: string, email: string, avatar?: string, institution?: string, department?: string) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  refreshData: () => Promise<void>;
};

const MockDataContext = createContext<DataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [profile, setProfile] = useState<StudentProfile>({
    name: "",
    email: "",
    preparednessScore: 0,
    certificates: 0,
  });
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [coursesRes, quizzesRes, alertsRes, profileRes, historyRes] = await Promise.allSettled([
        fetch("/api/courses").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/quizzes").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/alerts").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/user/profile").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/quizzes/history").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (coursesRes.status === "fulfilled" && coursesRes.value?.courses) {
        setCourses(coursesRes.value.courses);
      }
      if (quizzesRes.status === "fulfilled" && quizzesRes.value?.quizzes) {
        setQuizzes(quizzesRes.value.quizzes);
      }
      if (alertsRes.status === "fulfilled" && alertsRes.value?.alerts) {
        setAlerts(alertsRes.value.alerts);
      }
      if (profileRes.status === "fulfilled" && profileRes.value?.profile) {
        const p = profileRes.value.profile;
        setProfile({
          name: p.name || "",
          email: p.email || "",
          avatar: p.avatar,
          preparednessScore: p.preparedness_score ?? 0,
          certificates: p.certificates ?? 0,
        });
      }
      if (historyRes.status === "fulfilled" && historyRes.value?.attempts) {
        setQuizAttempts(historyRes.value.attempts);
      }
    } catch (err) {
      console.error("Error fetching live database records:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const markLessonComplete = async (courseSlug: string, lessonId: string | number) => {
    // Optimistic UI update
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.slug !== courseSlug) return course;

        let foundCurrent = false;
        let completedCount = 0;

        const updatedLessons = course.lessons.map((lesson) => {
          if (String(lesson.id) === String(lessonId) || lesson.lessonId === String(lessonId)) {
            foundCurrent = true;
            completedCount++;
            return { ...lesson, status: "completed" as const };
          }
          if (lesson.status === "completed") {
            completedCount++;
            return lesson;
          }
          if (foundCurrent && lesson.status === "locked") {
            foundCurrent = false;
            return { ...lesson, status: "in-progress" as const };
          }
          return lesson;
        });

        const progress = course.lessons.length > 0 ? Math.round((completedCount / course.lessons.length) * 100) : 100;
        return { ...course, lessons: updatedLessons, progress };
      })
    );

    // Call real API
    try {
      await fetch(`/api/courses/${courseSlug}/lessons/${lessonId}/complete`, {
        method: "POST",
      });
      const profRes = await fetch("/api/user/profile");
      if (profRes.ok) {
        const data = await profRes.json();
        if (data.profile) {
          setProfile((prev) => ({
            ...prev,
            preparednessScore: data.profile.preparedness_score,
            certificates: data.profile.certificates,
          }));
        }
      }
    } catch (e) {
      console.error("API error completing lesson:", e);
    }
  };

  const submitQuiz = async (quizSlug: string, score: number, total: number, answers?: any): Promise<string> => {
    const attemptId = `attempt_${Date.now()}`;
    const quiz = quizzes.find((q) => q.slug === quizSlug);

    const localAttempt: QuizAttempt = {
      id: attemptId,
      quizSlug,
      quizTitle: quiz?.title || quizSlug,
      score,
      total,
      date: new Date().toISOString(),
    };

    setQuizAttempts((prev) => [localAttempt, ...prev]);

    try {
      const res = await fetch(`/api/quizzes/${quizSlug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, total, answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => ({
          ...prev,
          preparednessScore: Math.min(100, prev.preparednessScore + (score / total >= 0.7 ? 10 : 3)),
        }));
        return data.attemptId || attemptId;
      }
    } catch (e) {
      console.error("Quiz submission API error:", e);
    }

    return attemptId;
  };

  const markAlertRead = async (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
    try {
      await fetch(`/api/alerts/${alertId}/read`, { method: "POST" });
    } catch (e) {
      console.error("Mark alert read API error:", e);
    }
  };

  const updateProfile = async (
    name: string,
    email: string,
    avatar?: string,
    institution?: string,
    department?: string
  ) => {
    setProfile((prev) => ({ ...prev, name, email, avatar }));
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar, institution, department }),
      });
    } catch (e) {
      console.error("Update profile API error:", e);
    }
  };

  const addCourse = async (course: Course) => {
    setCourses((prev) => [course, ...prev]);
    try {
      await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });
    } catch (e) {
      console.error("Add course API error:", e);
    }
  };

  return (
    <MockDataContext.Provider
      value={{
        courses,
        quizzes,
        alerts,
        profile,
        quizAttempts,
        isLoading,
        markLessonComplete,
        submitQuiz,
        markAlertRead,
        updateProfile,
        addCourse,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
}
