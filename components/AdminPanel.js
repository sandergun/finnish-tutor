import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Eye, Settings, Check, AlertCircle, Wand2, RefreshCw, Trash2, X, Sparkles, Loader2, MessageSquare, Edit } from 'lucide-react';
import StatsCharts from './StatsCharts';
import SituationEditor from './SituationEditor';
import { supabase } from '../lib/supabase';
import { useUserStore } from '@/store/useUserStore';

// Manual Generation Component
const ManualGenerate = ({ onGenerate, loading, userLevel }) => {
  const [formData, setFormData] = useState({
    topic: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.topic.trim()) {
      onGenerate({ topic: formData.topic, level: userLevel });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-xl font-bold text-white">Ручная генерация</h3>
      <div>
        <label className="block text-white mb-2 font-medium">
          Тема урока <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder='Например: "В ресторане", "Погода"'
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition placeholder-gray-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !formData.topic.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/50 transition-all"
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Генерация...</> : <><Sparkles className="w-5 h-5" />Сгенерировать урок</>}
      </button>
    </form>
  );
};

const SettingsTab = ({ darkMode, onResetProfile }) => {
  const [settings, setSettings] = useState({
    wordsPerCycle: 5,
    cardCount: 15,
    quizCount: 15,
    dialogueCount: 2,
    primaryColor: '#8B5CF6', // purple-500
    accentColor: '#EC4899', // pink-500
    backgroundColor: '#111827' // gray-900
  });

  const [isResetting, setIsResetting] = useState(false);

  const handleResetProfile = async () => {
    console.log('🔴 Reset Profile Button Clicked. Prop onResetProfile:', onResetProfile);
    if (confirm('ВЫ УВЕРЕНЫ? ВЕСЬ ПРОГРЕСС БУДЕТ УДАЛЕН НАВСЕГДА.')) {
      if (confirm('ТОЧНО? ЭТО ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ.')) {
        if (onResetProfile) {
          setIsResetting(true);
          try {
            console.log('⏳ Calling onResetProfile...');
            await onResetProfile();
            console.log('✅ onResetProfile completed');
          } catch (error) {
            console.error('❌ Error during reset:', error);
            alert('Ошибка при сбросе.');
          } finally {
            setIsResetting(false);
          }
        } else {
          console.error('❌ onResetProfile prop is MISSING!');
          alert("Ошибка: функция сброса не найдена. Обновите страницу.");
        }
      }
    }
  };

  const handleSettingsChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSaveSettings = () => {
    // In a real app, you'd save this to a database or a config file.
    // For now, we can just log it.
    console.log('Saving settings:', settings);
    alert('Настройки сохранены (в консоли)!');
  };

  return (
    <div className="space-y-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-xl font-bold text-white">Настройки</h3>

      <div className="border-b border-gray-700 pb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Генерация уроков</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white mb-2 font-medium">
              Слов за один цикл
            </label>
            <input
              type="number"
              name="wordsPerCycle"
              value={settings.wordsPerCycle}
              onChange={handleSettingsChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">
              Количество карточек
            </label>
            <input
              type="number"
              name="cardCount"
              value={settings.cardCount}
              onChange={handleSettingsChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">
              Количество вопросов
            </label>
            <input
              type="number"
              name="quizCount"
              value={settings.quizCount}
              onChange={handleSettingsChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">
              Количество диалогов
            </label>
            <input
              type="number"
              name="dialogueCount"
              value={settings.dialogueCount}
              onChange={handleSettingsChange}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <h4 className="text-lg font-semibold text-white mb-4">Тема и цвета</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white mb-2 font-medium">
              Основной цвет
            </label>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
              <input type="color" name="primaryColor" value={settings.primaryColor} onChange={handleSettingsChange} className="w-8 h-8 p-0 border-none bg-transparent" />
              <span className="text-white">{settings.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">
              Акцентный цвет
            </label>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
              <input type="color" name="accentColor" value={settings.accentColor} onChange={handleSettingsChange} className="w-8 h-8 p-0 border-none bg-transparent" />
              <span className="text-white">{settings.accentColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-white mb-2 font-medium">
              Цвет фона
            </label>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
              <input type="color" name="backgroundColor" value={settings.backgroundColor} onChange={handleSettingsChange} className="w-8 h-8 p-0 border-none bg-transparent" />
              <span className="text-white">{settings.backgroundColor}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
      >
        Сохранить настройки
      </button>

      <div className="pt-8 mt-8 border-t border-red-900/50">
        <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> Опасная зона
        </h4>
        <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-6">
          <h5 className="text-white font-medium mb-2">Сброс прогресса</h5>
          <p className="text-red-200/70 text-sm mb-4">
            Это действие удалит ВСЮ вашу статистику, достижения, изученные слова и пройденные уроки.
            <br />
            <strong>Это действие необратимо.</strong>
          </p>
          <button
            onClick={handleResetProfile}
            disabled={isResetting}
            className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 ${isResetting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {isResetting ? 'Сброс...' : 'Сбросить весь мой прогресс'}
          </button>
        </div>
      </div>
    </div>
  );
};


const LessonPreview = ({ lesson }) => {
  if (!lesson) return null;
  const data = lesson.lesson_data || lesson;

  return (
    <div className="text-white space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-purple-300">Описание</h4>
        <p className="text-gray-300 mt-1">{data.description}</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-purple-300">Теория</h4>
        <div className="prose prose-invert mt-2" dangerouslySetInnerHTML={{ __html: data.theory }} />
      </div>
      {data.finnish_fact && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 flex gap-3 items-start">
          <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Факт о Финляндии</p>
            <p className="text-sm text-gray-300 italic">{data.finnish_fact}</p>
          </div>
        </div>
      )}
      <div>
        <h4 className="text-lg font-semibold text-purple-300">Карточки ({data.cards?.length || 0})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {data.cards?.map((card, i) => (
            <div key={i} className="bg-gray-800 p-3 rounded-lg">
              <p><strong>{card.finnish}</strong> - {card.russian} {card.emoji}</p>
              <p className="text-sm text-gray-400">{card.example_sentence.finnish}</p>
              <p className="text-sm text-gray-500">{card.example_sentence.russian}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-purple-300">Вопросы ({data.quiz?.length || 0})</h4>
        <ul className="space-y-2 mt-2">
          {data.quiz?.map((q, i) => (
            <li key={i} className="bg-gray-800 p-3 rounded-lg text-sm">
              <p className="font-medium">{i + 1}. {q.question}</p>
              <p className="text-green-400">✓ {q.correct}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AdminPanel({ darkMode, onLessonGenerated, user, fullProgress, allLessons, onResetProfile }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [manualLoading, setManualLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  const [stats, setStats] = useState(null);

  // Situations State
  const { situations, loadSituations, createSituation, deleteSituation, deleteAllSituations, deleteSituations } = useUserStore();
  const [editingSituation, setEditingSituation] = useState(null);
  const [selectedSituationIds, setSelectedSituationIds] = useState([]);

  const handleSelectSituation = (id) => {
    setSelectedSituationIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAllSituations = (e) => {
    if (e.target.checked) {
      setSelectedSituationIds(situations.map(s => s.id));
    } else {
      setSelectedSituationIds([]);
    }
  };

  const handleDeleteSelectedSituations = async () => {
    if (!confirm(`Удалить выбранные ситуации (${selectedSituationIds.length})?`)) return;
    try {
      await deleteSituations(selectedSituationIds);
      setSelectedSituationIds([]);
      setResult({ success: true, message: 'Выбранные ситуации удалены.' });
    } catch (e) {
      setError('Ошибка массового удаления: ' + e.message);
    }
  };
  // ... (keeping existing lines)

  // ...



  const handleDeleteAllSituations = async () => {
    if (!confirm('ВЫ УВЕРЕНЫ? Это удалит ВСЕ ситуации безвозвратно.')) return;
    if (!confirm('Абсолютно точно?')) return;
    try {
      await deleteAllSituations();
      setResult({ success: true, message: 'Все ситуации были удалены.' });
    } catch (e) {
      setError('Ошибка удаления всего: ' + e.message);
    }
  };
  const [isSituationEditorOpen, setIsSituationEditorOpen] = useState(false);

  const [situationGenLoading, setSituationGenLoading] = useState(false);
  const [situationTopic, setSituationTopic] = useState('');

  useEffect(() => {
    if (activeTab === 'manage') loadLessons();
    else if (activeTab === 'stats') loadStats();
    else if (activeTab === 'situations') loadSituations();
  }, [activeTab]);

  const loadLessons = async () => {
    setLoadingLessons(true);
    setSelectedLessonIds([]);
    const { data, error } = await supabase.from('ai_lessons').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading lessons:', error);
      setError('Не удалось загрузить уроки. Проверьте консоль браузера.');
    }
    setLessons(data || []);
    setLoadingLessons(false);
  };

  const loadStats = async () => { /* Placeholder for future stats implementation */ };

  const deleteLesson = async (lessonId) => {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) return;
    const { error } = await supabase.from('ai_lessons').delete().eq('id', lessonId);
    if (error) {
      setError(`Не удалось удалить урок: ${error.message}`);
    } else {
      if (onLessonGenerated) onLessonGenerated();
      loadLessons();
      setResult({ success: true, message: 'Урок успешно удалён' });
      setTimeout(() => setResult(null), 3000);
    }
  };

  const deleteAllLessons = async () => {
    if (!confirm('!!! ВЫ УВЕРЕНЫ, ЧТО ХОТИТЕ УДАЛИТЬ ВСЕ AI-УРОКИ? ЭТО ДЕЙСТВИЕ НЕОБРАТИМО.')) return;
    const { error } = await supabase.from('ai_lessons').delete().not('id', 'is', null);
    if (error) {
      setError(`Не удалось удалить все уроки: ${error.message}`);
    } else {
      if (onLessonGenerated) onLessonGenerated();
      loadLessons();
      setResult({ success: true, message: 'Все AI-уроки были удалены.' });
    }
  };

  const deleteSelectedLessons = async () => {
    if (!confirm(`Вы уверены, что хотите удалить ${selectedLessonIds.length} выбранных уроков?`)) return;
    const { error } = await supabase.from('ai_lessons').delete().in('id', selectedLessonIds);
    if (error) {
      setError(`Не удалось удалить выбранные уроки: ${error.message}`);
    } else {
      if (onLessonGenerated) onLessonGenerated();
      loadLessons();
      setResult({ success: true, message: `${selectedLessonIds.length} уроков было удалено.` });
    }
  }

  const handleApiCall = async (body, setLoading) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const rawData = await response.text();

      if (!response.ok) {
        let errorMessage = `Ошибка сервера: ${response.status}`;
        try {
          // Clean the raw data to remove markdown fences before parsing
          const jsonMatch = rawData.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          const cleanedData = jsonMatch ? jsonMatch[1].trim() : rawData.trim();

          const errorJson = JSON.parse(cleanedData);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch (e) {
          // It's not a valid JSON error, so use the raw text if available
          if (rawData.trim()) errorMessage = rawData;
        }
        throw new Error(errorMessage);
      }

      // Clean the raw data to remove markdown fences
      const jsonMatch = rawData.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const cleanedData = jsonMatch ? jsonMatch[1].trim() : rawData.trim();

      const data = JSON.parse(cleanedData);

      if (!data.success || !data.lesson) {
        throw new Error('API вернул некорректный ответ');
      }

      setResult({ success: true, message: `Урок "${data.lesson.title}" успешно создан!`, lesson: data.lesson });
      if (onLessonGenerated) onLessonGenerated();
      if (activeTab === 'manage') loadLessons();

    } catch (err) {
      console.error('Ошибка генерации:', err);
      setError(err.message || 'Неизвестная ошибка при создании урока');
    } finally {
      setLoading(false);
    }
  };

  const handleManualGenerate = (formData) => handleApiCall(formData, setManualLoading);
  const handleAutoGenerate = () => handleApiCall({ topic: 'auto', level: user.level }, setAutoLoading);

  // Situation Generation
  // Situation Generation
  const handleGenerateSituation = async (mode, topic = '') => {
    setSituationGenLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/generate-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, topic, level: user.level || 'A1' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generaton failed');

      // IMMEDIATE SAVE (Skip Editor)
      await createSituation(data.situation);
      setResult({ success: true, message: `✨ Ситуация "${data.situation.title}" успешно сгенерирована и сохранена!` });

    } catch (e) {
      setError(e.message);
    } finally {
      setSituationGenLoading(false);
    }
  };

  const handleSaveSituation = async (situationInfo) => {
    try {
      await createSituation(situationInfo);
      setIsSituationEditorOpen(false);
      setEditingSituation(null);
      setResult({ success: true, message: 'Ситуация сохранена!' });
    } catch (e) {
      setError('Ошибка сохранения: ' + e.message);
    }
  };

  const handleDeleteSituation = async (id) => {
    if (!confirm('Удалить эту ситуацию?')) return;
    try {
      await deleteSituation(id);
      setResult({ success: true, message: 'Ситуация удалена.' });
    } catch (e) {
      setError('Ошибка удаления: ' + e.message);
    }
  };


  const handleSelectLesson = (lessonId) => {
    setSelectedLessonIds(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLessonIds(lessons.map(l => l.id));
    } else {
      setSelectedLessonIds([]);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500 rounded-xl"><Sparkles className="w-6 h-6 text-white" /></div>
          <div>
            <h2 className="text-2xl font-bold text-white">Админ панель</h2>
            <p className="text-gray-400 text-sm">Управление AI-уроками и статистика</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setActiveTab('generate')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'generate' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><Plus className="w-4 h-4" />Создать урок</button>
        <button onClick={() => setActiveTab('situations')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'situations' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><MessageSquare className="w-4 h-4" />Ситуации</button>
        <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'stats' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><BarChart3 className="w-4 h-4" />Статистика</button>
        <button onClick={() => setActiveTab('manage')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'manage' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><Eye className="w-4 h-4" />Управление</button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}><Settings className="w-4 h-4" />Настройки</button>
      </div>

      {result && <div className="mb-4 p-4 rounded-lg bg-green-900/50 text-green-300 border border-green-700 flex items-center gap-3"><Check className="w-5 h-5" />{result.message}</div>}
      {error && <div className="mb-4 p-4 rounded-lg bg-red-900/50 text-red-300 border border-red-700 flex items-center gap-3"><AlertCircle className="w-5 h-5" />{error}</div>}

      {activeTab === 'situations' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Управление ситуациями</h3>

            {/* Generation Controls */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Тема ситуации (опционально)..."
                    value={situationTopic}
                    onChange={(e) => setSituationTopic(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    onClick={() => handleGenerateSituation('manual', situationTopic)}
                    disabled={situationGenLoading || !situationTopic.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    title="Создать ситуацию по этой теме"
                  >
                    {situationGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Сгенерировать
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-800">

                {/* 2. Auto AI */}
                <button
                  onClick={() => handleGenerateSituation('auto')}
                  disabled={situationGenLoading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  title="AI подберет тему под уровень"
                >
                  {situationGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  AI: Авто
                </button>

                {/* 3. Random AI */}
                <button
                  onClick={() => handleGenerateSituation('random')}
                  disabled={situationGenLoading}
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  title="Случайная бытовая ситуация"
                >
                  {situationGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  AI: Рандом
                </button>

                {/* Manual Editor (No AI) */}
                <button
                  onClick={() => { setEditingSituation(null); setIsSituationEditorOpen(true); }}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition ml-auto border border-gray-600"
                >
                  <Plus className="w-4 h-4" /> Ручной ввод
                </button>

                {/* Delete All Situations */}
                <button
                  onClick={handleDeleteAllSituations}
                  className="flex items-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 px-4 py-2 rounded-lg transition border border-red-900/30"
                  title="Удалить ВСЕ ситуации"
                >
                  <Trash2 className="w-4 h-4" /> Удалить все
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">

              {/* Batch Actions Toolbar */}
              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSituationIds.length === situations.length && situations.length > 0}
                    onChange={handleSelectAllSituations}
                    disabled={situations.length === 0}
                    className="w-5 h-5 bg-gray-800 border-gray-600 rounded text-purple-500 focus:ring-purple-600 cursor-pointer"
                  />
                  <span className="text-gray-400 text-sm">Выбрать все</span>
                </div>

                {selectedSituationIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelectedSituations}
                    className="flex items-center gap-2 bg-red-900/40 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-900/60 transition text-sm animate-in fade-in slide-in-from-right-4"
                  >
                    <Trash2 className="w-4 h-4" /> Удалить выбранные ({selectedSituationIds.length})
                  </button>
                )}
              </div>

              {situations.map(sit => (
                <div key={sit.id} className={`bg-gray-900 border p-4 rounded-xl flex justify-between items-center group transition-colors
                    ${selectedSituationIds.includes(sit.id) ? 'border-purple-500/50 bg-purple-900/10' : 'border-gray-700'}`}>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedSituationIds.includes(sit.id)}
                      onChange={() => handleSelectSituation(sit.id)}
                      className="w-5 h-5 bg-gray-800 border-gray-600 rounded text-purple-500 focus:ring-purple-600 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">{sit.level}</span>
                        <span className="font-bold text-white">{sit.title}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{sit.description_ru}</p>
                      <span className="text-xs text-gray-500">{sit.steps.length} шагов</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingSituation(sit); setIsSituationEditorOpen(true); }} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteSituation(sit.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {situations.length === 0 && <p className="text-gray-500 text-center py-4">Нет ситуаций</p>}
            </div>
          </div>


          {isSituationEditorOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
                <SituationEditor
                  initialData={editingSituation}
                  onSave={handleSaveSituation}
                  onClose={() => setIsSituationEditorOpen(false)}
                  user={user}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-700 text-center">
            <h3 className="text-xl font-bold text-white mb-3">Автоматическая генерация</h3>
            <p className="text-blue-200 mb-4 text-sm max-w-md mx-auto">Система сама подберет следующую тему урока, основываясь на вашем прогрессе и уровне.</p>
            <button onClick={handleAutoGenerate} disabled={autoLoading || manualLoading} className="w-full max-w-sm mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/50 transition-all">
              {autoLoading ? <><Loader2 className="w-5 h-5 animate-spin" />Подбор темы...</> : <><Wand2 className="w-5 h-5" />Сгенерировать следующий урок</>}
            </button>
          </div>
          <div className="text-center text-gray-500">- ИЛИ -</div>
          <ManualGenerate onGenerate={handleManualGenerate} loading={manualLoading} userLevel={user.level} />
        </div>
      )}

      {activeTab === 'manage' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Все AI-уроки ({lessons.length})</h3>
            <div className="flex gap-2">
              <button onClick={loadLessons} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"><RefreshCw className="w-4 h-4" />Обновить</button>
              <button onClick={deleteAllLessons} className="flex items-center gap-2 px-4 py-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-800/50 transition"><Trash2 className="w-4 h-4" />Удалить все</button>
            </div>
          </div>

          {selectedLessonIds.length > 0 && (
            <div className="bg-gray-700/50 rounded-xl p-4 mb-4 flex items-center justify-between">
              <span className="text-white font-medium">Выбрано: {selectedLessonIds.length}</span>
              <button onClick={deleteSelectedLessons} className="flex items-center gap-2 px-4 py-2 bg-red-900/80 text-red-200 rounded-lg hover:bg-red-800/80 transition"><Trash2 className="w-4 h-4" />Удалить выбранные</button>
            </div>
          )}

          {loadingLessons ? <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" /><p className="text-gray-400 mt-2">Загрузка уроков...</p></div> :
            lessons.length === 0 ? <div className="text-center py-12 bg-gray-800 rounded-xl"><Sparkles className="w-12 h-12 mx-auto text-gray-600 mb-2" /><p className="text-gray-400">Нет созданных AI-уроков</p></div> :
              (
                <div className="space-y-3">
                  <div className="flex items-center bg-gray-800/50 rounded-xl p-2 border border-gray-700">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedLessonIds.length === lessons.length && lessons.length > 0}
                      className="ml-2 w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-600"
                    />
                    <span className="ml-4 font-semibold text-white">Выбрать все</span>
                  </div>
                  {lessons.map((lesson) => (
                    <div key={lesson.id} className={`bg-gray-800 rounded-xl p-4 border transition-all flex items-center ${selectedLessonIds.includes(lesson.id) ? 'border-purple-500' : 'border-gray-700 hover:border-gray-600'}`}>
                      <input
                        type="checkbox"
                        checked={selectedLessonIds.includes(lesson.id)}
                        onChange={() => handleSelectLesson(lesson.id)}
                        className="mr-4 w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-600"
                      />
                      <div className="flex-1">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">{lesson.level}</span>
                        <h4 className="font-bold text-white mt-2">{lesson.lesson_data.title || lesson.title}</h4>
                        <p className="text-sm text-gray-400">
                          {(lesson.lesson_data.cards?.length || 0) + (lesson.cards?.length || 0)} слов • {(lesson.lesson_data.quiz?.length || 0) + (lesson.quiz?.length || 0)} вопросов
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedLesson(lesson)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"><Eye className="w-4 h-4 text-white" /></button>
                        <button onClick={() => deleteLesson(lesson.id)} className="p-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 transition"><Trash2 className="w-4 h-4 text-red-300" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {activeTab === 'stats' && (
        <StatsCharts progress={fullProgress} lessons={allLessons} />
      )}

      {activeTab === 'settings' && (
        <SettingsTab darkMode={darkMode} onResetProfile={onResetProfile} />
      )}

      {selectedLesson && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLesson(null)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20 border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{selectedLesson.lesson_data.title || selectedLesson.title}</h3>
              <button onClick={() => setSelectedLesson(null)} className="p-1 rounded-full hover:bg-gray-700"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <LessonPreview lesson={selectedLesson} />
          </div>
        </div>
      )}
    </div>
  );
}