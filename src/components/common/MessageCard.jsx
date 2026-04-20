
import { Mail, Phone, Tag, Trash2 } from "lucide-react";
import { useThemeStore } from '../../store/useStore.js';

const MessageCard = ({ message, onDelete }) => {
  const { theme } = useThemeStore();
  const isDarkTheme = theme === 'dark';

  const {
    _id,
    firstName,
    lastName,
    email,
    phone,
    subject,
    message: text,
    createdAt,
  } = message;

  const initial = firstName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className={`group relative rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl ${isDarkTheme ? 'border border-white/5 bg-[#0B0F19] hover:border-red-500/40' : 'border border-slate-200 bg-white hover:border-red-300'}`}>

      {/* Top Right Delete */}
      <button
        onClick={() => onDelete(_id)}
        className={`absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full transition ${isDarkTheme ? 'bg-white/5 hover:bg-red-500/20' : 'bg-slate-100 hover:bg-red-50'}`}
      >
        <Trash2 size={18} className="text-red-400" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">

        {/* Avatar (Initial Letter) */}
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black transition-colors ${isDarkTheme ? 'bg-white/10 text-white group-hover:bg-gradient-to-br group-hover:from-primary-600 group-hover:to-red-400' : 'bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white'}`}>
          {initial}
        </div>

        {/* Name + Date */}
        <div>
          <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
            {firstName} {lastName}
          </h3>

          <p className={`mt-1 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-slate-500'}`}>
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${isDarkTheme ? 'bg-white/5' : 'bg-slate-50'}`}>
          <Mail size={16} className="text-blue-400" />
          <span className={`min-[320px]:max-[390px]:text-[11px] text-sm ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>{email}</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Subject */}
        <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${isDarkTheme ? 'border-amber-500/25 bg-amber-500/10' : 'border-amber-200 bg-amber-50'}`}>
          <Tag size={14} className="text-amber-400" />
          <span className={`text-xs font-semibold uppercase tracking-wide ${isDarkTheme ? 'text-amber-200' : 'text-amber-700'}`}>
            {subject || "General Inquiry"}
          </span>
        </div>

        {/* Phone */}
        {phone && (
          <div className={`flex items-center gap-2 rounded-lg px-4 py-2 ${isDarkTheme ? 'bg-white/5' : 'bg-slate-50'}`}>
            <Phone size={16} className="text-green-400" />
            <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>{phone}</span>
          </div>
        )}
      </div>

      {/* Message Box */}
      <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${isDarkTheme ? 'border-white/5 bg-black/40 text-gray-300' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
        {text}
      </div>
    </div>
  );
};

export default MessageCard;