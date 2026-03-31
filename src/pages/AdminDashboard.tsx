import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, Pencil, Trash2, LogOut, Search,
  Star, BookOpen, Users, TrendingUp, AlertTriangle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScholarships } from "@/hooks/useScholarships";
import { useAdminScholarships } from "@/hooks/useAdminScholarships";
import ScholarshipForm from "@/components/ScholarshipForm";
import { Scholarship } from "@/lib/types";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Scholarship | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Guard
  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const { data: scholarships = [], isLoading } = useScholarships();
  const { add, update, remove } = useAdminScholarships();

  const filtered = scholarships.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin");
  };

  const openAdd = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (s: Scholarship) => { setEditTarget(s); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTarget(null); };

  const handleSubmit = (data: Omit<Scholarship, "id" | "created_at">) => {
    if (editTarget) {
      update.mutate({ id: editTarget.id, data }, { onSuccess: closeForm });
    } else {
      add.mutate(data, { onSuccess: closeForm });
    }
  };

  const handleDelete = (id: string) => {
    remove.mutate(id, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
              <GraduationCap className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">ScholarHub</p>
              <p className="text-xs text-amber-400 font-medium">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20">
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              <BookOpen className="w-4 h-4" /> Scholarships
            </span>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 text-sm transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Scholarships</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage all scholarship listings</p>
          </div>
          <Button onClick={openAdd} className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-bold shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4 mr-2" /> Add Scholarship
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: "Total", value: scholarships.length, color: "text-blue-400", bg: "bg-blue-400/10" },
            { icon: Star, label: "Featured", value: scholarships.filter((s) => s.featured).length, color: "text-amber-400", bg: "bg-amber-400/10" },
            { icon: TrendingUp, label: "Categories", value: [...new Set(scholarships.map((s) => s.category))].length, color: "text-green-400", bg: "bg-green-400/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            placeholder="Search by title, provider, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading scholarships...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-slate-400 font-semibold">No scholarships found</p>
              <p className="text-slate-500 text-sm mt-1">Add your first scholarship to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Scholarship</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((s) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white text-sm">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.provider}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-green-400">{s.amount}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{s.deadline}</td>
                    <td className="px-5 py-4">
                      {s.featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-semibold">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-full bg-slate-700 text-slate-400 text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(s.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Scholarship Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ScholarshipForm
            initial={editTarget}
            onSubmit={handleSubmit}
            onClose={closeForm}
            loading={add.isPending || update.isPending}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Delete Scholarship?</h3>
                  <p className="text-sm text-slate-400">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 text-slate-400" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                  onClick={() => handleDelete(deleteId)}
                  disabled={remove.isPending}
                >
                  {remove.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
