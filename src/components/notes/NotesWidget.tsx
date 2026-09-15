import React, { useState, useEffect } from "react";
import { TodoItem } from "../../types";
import { getSettings, saveSettings } from "../../lib/chrome-storage";
import { CheckSquare, Square, Plus, Trash2, StickyNote, X, Sparkles } from "lucide-react";

interface NotesWidgetProps {
  enabled: boolean;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({ enabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", text: "Finish Status module", completed: true },
    { id: "2", text: "Review pull requests", completed: false },
    { id: "3", text: "Clean up Prisma migrations", completed: false },
  ]);
  const [newText, setNewText] = useState("");

  // Load saved notes
  useEffect(() => {
    getSettings().then((s) => {
      if (s.quickLinks && (s as any).savedNotes) {
        setTodos((s as any).savedNotes);
      }
    });
  }, []);

  const saveTodosToStorage = async (updated: TodoItem[]) => {
    setTodos(updated);
    const currentSettings = await getSettings();
    await saveSettings({
      ...currentSettings,
      savedNotes: updated,
    } as any);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const updated = [
      ...todos,
      { id: Date.now().toString(), text: newText.trim(), completed: false },
    ];
    saveTodosToStorage(updated);
    setNewText("");
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    saveTodosToStorage(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodosToStorage(updated);
  };

  if (!enabled) return null;

  // Task calculations
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="relative z-20 select-none">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel p-3 rounded-2xl flex items-center gap-2 hover:bg-white/15 transition-all text-white/90 shadow-glass"
        title="Quick Notes"
      >
        <StickyNote className="w-5 h-5 text-amber-300" />
        <span className="text-xs font-semibold hidden md:inline">Notes</span>
        {totalCount > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent">
            {completedCount}/{totalCount}
          </span>
        )}
      </button>

      {/* Expanded Notes Card */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl z-[100] border border-white/20 animate-fade-in space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-300" />
              <div>
                <h4 className="text-sm font-semibold text-white">
                  Quick Tasks & Notes
                </h4>
                <div className="text-[10px] text-white/60">
                  {totalCount === 0
                    ? "No tasks"
                    : `${completedCount} of ${totalCount} completed`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-xs font-extrabold text-white">{progressPercent}%</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Add Todo Input */}
          <form
            onSubmit={handleAddTodo}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add task or note..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs text-white bg-white/10 border border-white/15 focus:border-accent outline-none"
            />
            <button
              type="submit"
              className="p-1.5 bg-accent hover:bg-accent/90 text-black rounded-xl shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Todo List Items */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {todos.length === 0 ? (
              <p className="text-xs text-center py-4 text-white/50">
                No notes yet. Add one above!
              </p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-2 flex-1 text-left min-w-0"
                  >
                    {todo.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-white/40 shrink-0" />
                    )}
                    <span
                      className={`text-xs truncate transition-all ${
                        todo.completed
                          ? "line-through text-white/40"
                          : "text-white/90"
                      }`}
                    >
                      {todo.text}
                    </span>
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-red-400 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
