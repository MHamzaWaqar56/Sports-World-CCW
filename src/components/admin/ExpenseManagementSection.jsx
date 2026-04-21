import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import { formatPrice } from '../../utils/price';
import ConfirmModal from '../common/ConfirmModal';

const expenseTypes = ['Petrol', 'Food', 'Electricity Bill', 'Rent', 'Courier', 'Packing', 'Other'];

const getToday = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = () => ({
  date: getToday(),
  expenseType: 'Petrol',
  amount: '',
  notes: '',
});

const emptySummary = {
  totalExpenses: 0,
};

const ExpenseManagementSection = () => {
  const [form, setForm] = useState(createEmptyForm());
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState('');
  const [selectedExpenseNote, setSelectedExpenseNote] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadExpenses = async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/expenses');
      setExpenses(data.expenses || []);
      setSummary(data.summary || emptySummary);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const resetForm = () => {
    setEditingExpenseId('');
    setForm(createEmptyForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        date: form.date,
        expenseType: form.expenseType,
        amount: Number(form.amount),
        notes: form.notes,
      };

      if (editingExpenseId) {
        await api.put(`/expenses/${editingExpenseId}`, payload);
        toast.success('Expense updated');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense saved');
      }

      resetForm();
      await loadExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpenseId(expense._id);
    setForm({
      date: expense.date?.slice(0, 10) || getToday(),
      expenseType: expense.expenseType || 'Petrol',
      amount: String(expense.amount ?? ''),
      notes: expense.notes || '',
    });
  };

  const openNoteModal = (expense) => {
    setSelectedExpenseNote(expense);
  };

  const closeNoteModal = () => {
    setSelectedExpenseNote(null);
  };

  const openDeleteConfirm = (expenseId) => {
    setDeleteConfirm(expenseId);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const handleDelete = async (expenseId) => {
    openDeleteConfirm(expenseId);
  };

  return (
    <div className="space-y-8">
      <section className="panel-premium p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Expenses</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 min-[320px]:max-[430px]:leading-[20px]">
            Track outgoing business expenses separately from sales and bat repair records.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              className="w-full bg-slate-50 dark:bg-dark-bg border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Expense Type</label>
            <select
              value={form.expenseType}
              onChange={(event) => setForm((current) => ({ ...current, expenseType: event.target.value }))}
              className="w-full bg-slate-50 dark:bg-dark-bg border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
              required
            >
              {expenseTypes.map((expenseType) => (
                <option key={expenseType} value={expenseType}>
                  {expenseType}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              className="w-full bg-slate-50 dark:bg-dark-bg border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Notes</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="w-full bg-slate-50 dark:bg-dark-bg border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white"
              placeholder="Optional notes"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-3">
            {editingExpenseId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-bg"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-8 shadow-lg shadow-primary-600/20 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingExpenseId ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="metric-card">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Expenses</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(summary.totalExpenses || 0)}</p>
        </div>
      </section>

      <section className="table-shell">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-dark-border">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Expense Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-dark-bg/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-5 border-b text-left">Date</th>
                <th className="px-6 py-5 border-b text-center">Expense Type</th>
                <th className="px-6 py-5 border-b text-center">Amount</th>
                <th className="px-6 py-5 border-b text-center">Notes</th>
                <th className="px-6 py-5 border-b text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {!loading && expenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    No expenses recorded yet.
                  </td>
                </tr>
              )}
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-slate-50/60 dark:hover:bg-dark-bg/50">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{expense.date?.slice(0, 10)}</td>
                  <td className="px-6 py-4 text-center font-semibold text-slate-900 dark:text-white">{expense.expenseType}</td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300">{formatPrice(expense.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => openNoteModal(expense)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${expense.notes ? 'border-primary-500/20 bg-primary-500/10 text-primary-700 hover:bg-primary-500/15 dark:text-primary-200' : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-dark-border dark:bg-dark-bg dark:text-slate-500'}`}
                    >
                      {expense.notes ? 'View Note' : 'No Note'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(expense)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-bg"
                        aria-label="Edit expense"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-dark-border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                        aria-label="Delete expense"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedExpenseNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/5 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#10151d] p-6 shadow-[0_32px_100px_-40px_rgba(0,0,0,1)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-300">Expense Note</p>
                <h3 className="mt-2 text-2xl font-black text-white">Expense Entry Note</h3>
              </div>
              <button
                type="button"
                onClick={closeNoteModal}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Expense Type</p>
                  <p className="mt-2 font-bold text-white">{selectedExpenseNote.expenseType || '—'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Date</p>
                  <p className="mt-2 font-bold text-white">{selectedExpenseNote.date?.slice(0, 10) || '—'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Note</p>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-200">
                  {selectedExpenseNote.notes?.trim() || 'No note available for this entry.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={Boolean(deleteConfirm)}
        title="Delete Expense"
        description="Delete this expense entry? This action cannot be undone."
        confirmLabel="Yes, Delete"
        tone="danger"
        onCancel={closeDeleteConfirm}
        onConfirm={async () => {
          if (!deleteConfirm) return;

          try {
            await api.delete(`/expenses/${deleteConfirm}`);
            if (editingExpenseId === deleteConfirm) {
              resetForm();
            }
            toast.success('Expense deleted');
            await loadExpenses();
          } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete expense');
          } finally {
            closeDeleteConfirm();
          }
        }}
      />
    </div>
  );
};

export default ExpenseManagementSection;