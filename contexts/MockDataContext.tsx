"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  mockCourses, 
  mockQuizzes, 
  mockAlerts, 
  mockStudent,
  Course,
  Quiz,
  Alert,
  StudentProfile,
  QuizAttempt,
  Lesson
} from "@/lib/mockData";

type MockDataContextType = {
  courses: Course[];
  quizzes: Quiz[];
  alerts: Alert[];
  profile: StudentProfile;
  quizAttempts: QuizAttempt[];
  markLessonComplete: (courseSlug: string, lessonId: string) => void;
  submitQuiz: (quizSlug: string, score: number, total: number) => string; // returns attemptId
  markAlertRead: (alertId: string) => void;
  updateProfile: (name: string, email: string, avatar?: string) => void;
  addCourse: (course: Course) => void;
};

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  // Use localStorage to persist state if possible, otherwise fall back to initial mocks
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [profile, setProfile] = useState<StudentProfile>(mockStudent);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage or use defaults
    const storedCourses = localStorage.getItem("resq_mock_courses");
    const storedQuizzes = localStorage.getItem("resq_mock_quizzes");
    const storedAlerts = localStorage.getItem("resq_mock_alerts");
    const storedStudent = localStorage.getItem("resq_mock_student");
    const storedAttempts = localStorage.getItem("resq_mock_attempts");

    if (storedCourses) setCourses(JSON.parse(storedCourses));
    else setCourses(mockCourses);

    if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
    else setQuizzes(mockQuizzes);

    if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
    else setAlerts(mockAlerts);

    if (storedStudent) {
      const parsed = JSON.parse(storedStudent);
      setProfile({ ...mockStudent, ...parsed });
    } else {
      setProfile(mockStudent);
    }

    if (storedAttempts) setQuizAttempts(JSON.parse(storedAttempts));
    
    setMounted(true);
  }, []);

  // Save to localStorage whenever state changes (if mounted)
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("resq_mock_courses", JSON.stringify(courses));
    localStorage.setItem("resq_mock_quizzes", JSON.stringify(quizzes));
    localStorage.setItem("resq_mock_alerts", JSON.stringify(alerts));
    localStorage.setItem("resq_mock_student", JSON.stringify(profile));
    localStorage.setItem("resq_mock_attempts", JSON.stringify(quizAttempts));
  }, [courses, quizzes, alerts, profile, quizAttempts, mounted]);

  const markLessonComplete = (courseSlug: string, lessonId: string) => {
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.slug !== courseSlug) return course;

        let foundCurrent = false;
        let completedCount = 0;

        const updatedLessons = course.lessons.map((lesson, idx) => {
          if (lesson.id === lessonId) {
            foundCurrent = true;
            completedCount++;
            return { ...lesson, status: "completed" as const };
          }
          if (lesson.status === "completed") {
            completedCount++;
            return lesson;
          }
          if (foundCurrent && lesson.status === "locked") {
            foundCurrent = false; // Only unlock the immediate next one
            return { ...lesson, status: "in-progress" as const };
          }
          return lesson;
        });

        // Recalculate progress
        const progress = Math.round((completedCount / course.lessons.length) * 100);

        return {
          ...course,
          lessons: updatedLessons,
          progress
        };
      });
    });
  };

  const submitQuiz = (quizSlug: string, score: number, total: number) => {
    const quiz = quizzes.find(q => q.slug === quizSlug);
    if (!quiz) return "";

    const attemptId = `attempt_${Date.now()}`;
    const newAttempt: QuizAttempt = {
      id: attemptId,
      quizSlug,
      quizTitle: quiz.title,
      score,
      total,
      date: new Date().toISOString()
    };

    setQuizAttempts(prev => [newAttempt, ...prev]);

    // Update student score (mock logic: add 10 points for a good score)
    if (score / total >= 0.7) {
      setProfile(prev => ({ ...prev, preparednessScore: prev.preparednessScore + 10 }));
    }

    return attemptId;
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const updateProfile = (name: string, email: string, avatar?: string) => {
    setProfile(prev => ({ ...prev, name, email, avatar }));
  };

  const addCourse = (course: Course) => {
    setCourses(prev => [course, ...prev]);
  };

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <MockDataContext.Provider value={{
      courses,
      quizzes,
      alerts,
      profile,
      quizAttempts,
      markLessonComplete,
      submitQuiz,
      markAlertRead,
      updateProfile,
      addCourse
    }}>
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
