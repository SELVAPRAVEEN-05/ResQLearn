"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, CheckCircle2, XCircle, FileVideo, FileText, Image as ImageIcon, BookOpen } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  type: "video" | "document" | "image";
};

type Course = {
  id: string;
  disasterCategory: string;
  isPublished: boolean;
  lessons: Lesson[];
};

const initialCourses: Course[] = [
  {
    id: "c1",
    disasterCategory: "Flood",
    isPublished: true,
    lessons: [
      { id: "l1", title: "Introduction", type: "video" },
      { id: "l2", title: "Causes", type: "document" },
      { id: "l3", title: "Warning Signs", type: "image" },
      { id: "l4", title: "Before Flood", type: "document" },
      { id: "l5", title: "During Flood", type: "video" },
      { id: "l6", title: "After Flood", type: "document" },
    ]
  },
  {
    id: "c2",
    disasterCategory: "Earthquake",
    isPublished: false,
    lessons: [
      { id: "l7", title: "Drop, Cover, and Hold On", type: "video" },
      { id: "l8", title: "Structural Safety", type: "document" },
    ]
  }
];

export default function ManageContentPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [expanded, setExpanded] = useState<string[]>(["c1"]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Flood");

  const toggleExpand = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter(e => e !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  const togglePublish = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, isPublished: !c.isPublished } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const newCourse: Course = {
      id: `c${Date.now()}`,
      disasterCategory: newCategory,
      isPublished: false,
      lessons: []
    };
    setCourses([...courses, newCourse]);
    setIsCreating(false);
    setNewTitle("");
    setNewCategory("Flood");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo size={14} className="text-[#3B82F6]" />;
      case 'document': return <FileText size={14} className="text-[#10B981]" />;
      case 'image': return <ImageIcon size={14} className="text-[#F59E0B]" />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#111827]">Educational Content</h1>
          <p className="text-sm text-[#6B7280]">Manage courses and lessons</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 rounded-xl bg-[#10B981] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0E9F6E] transition"
        >
          <Plus size={16} />
          Create Course
        </button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            {/* Course Header */}
            <div className="flex items-center justify-between bg-[#F9FAFB] p-4 border-b border-[#E5E7EB]">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleExpand(course.id)}
              >
                <div className={`transition-transform duration-200 ${expanded.includes(course.id) ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} className="text-[#6B7280]" />
                </div>
                <h2 className="text-base font-bold text-[#111827]">{course.disasterCategory} Safety</h2>
                <span className={`ml-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${course.isPublished ? 'bg-[#D1FAE5] text-[#047857]' : 'bg-[#F3F4F6] text-[#4B5563]'}`}>
                  {course.isPublished ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => togglePublish(course.id)}
                  className="rounded p-1.5 text-[#6B7280] hover:bg-[#E5E7EB]"
                  title={course.isPublished ? 'Unpublish' : 'Publish'}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => deleteCourse(course.id)}
                  className="rounded p-1.5 text-[#EF4444] hover:bg-[#FEF2F2]"
                  title="Delete Course"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Course Lessons */}
            {expanded.includes(course.id) && (
              <div className="p-4 bg-white">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Curriculum ({course.lessons.length} lessons)</span>
                  <button className="text-xs font-semibold text-[#10B981] hover:underline flex items-center gap-1">
                    <Plus size={14} /> Add Lesson
                  </button>
                </div>
                
                <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-[#E5E7EB] ml-1">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="relative flex items-center justify-between pl-6 group">
                      <div className="absolute left-0 top-1/2 -mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#10B981]"></div>
                      <div className="flex items-center gap-2 py-2">
                        {getIcon(lesson.type)}
                        <span className="text-sm font-medium text-[#111827]">{lesson.title}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-[#6B7280] hover:text-[#111827]"><Edit2 size={14}/></button>
                        <button className="p-1 text-[#EF4444] hover:text-[#B91C1C]"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] p-8 text-center">
            <BookOpen size={32} className="mx-auto text-[#9CA3AF] mb-3" />
            <h3 className="text-sm font-bold text-[#111827]">No courses yet</h3>
            <p className="text-xs text-[#6B7280] mt-1">Get started by creating your first educational course.</p>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl animate-[fadeIn_0.2s_ease-out]">
            <h3 className="mb-4 text-lg font-bold text-[#111827]">Create New Course</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Course Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Earthquake Safety"
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-1">Category</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                >
                  <option value="Flood">Flood</option>
                  <option value="Earthquake">Earthquake</option>
                  <option value="Fire">Fire</option>
                  <option value="Cyclone">Cyclone</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setIsCreating(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!newTitle.trim()}
                className="rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0E9F6E] disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
