'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Plus, Eye, Trash2, Edit, Save, X, MessageSquare, Play } from 'lucide-react';

export default function SituationEditor({ onSave, initialData, onClose, user }) {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState(initialData || {
        title: '',
        description_ru: '',
        level: 'A1',
        steps: [
            { step: 1, prompt_ru: '', expected_fi: [''], hint_ru: '' }
        ]
    });

    useEffect(() => {
        setMounted(true);
        // Lock body scroll when modal is open
        document.body.style.overflow = 'hidden';

        if (initialData) {
            console.log("SituationEditor received data:", initialData); // Debug log
            setData(initialData);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [initialData]);

    const handleStepChange = (index, field, value) => {
        const newSteps = [...data.steps];
        if (field === 'expected_fi') {
            // Handle array input (comma separated for simple UI)
            newSteps[index][field] = value.split(',').map(s => s.trim());
        } else {
            newSteps[index][field] = value;
        }
        setData({ ...data, steps: newSteps });
    };

    const addStep = () => {
        setData({
            ...data,
            steps: [...data.steps, { step: data.steps.length + 1, prompt_ru: '', expected_fi: [''], hint_ru: '' }]
        });
    };

    const removeStep = (index) => {
        const newSteps = data.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 }));
        setData({ ...data, steps: newSteps });
    };

    const handleSubmit = async () => {
        if (!data.title) return alert('Title required');
        onSave(data);
    };

    const handleChange = (field, value) => {
        setData({ ...data, [field]: value });
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-4 space-y-4">
                <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {initialData ? <Edit className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-green-400" />}
                        {initialData ? 'Редактировать' : 'Создать'} Ситуацию
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-8">
                        <label className="text-gray-400 text-xs uppercase font-bold ml-1 mb-1 block">Название (RU)</label>
                        <input
                            value={data.title}
                            onChange={e => handleChange('title', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-gray-400 text-xs uppercase font-bold ml-1 mb-1 block">Уровень</label>
                        <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-400 text-center font-mono">
                            {data.level || 'A1'}
                        </div>
                    </div>
                    <div className="col-span-12">
                        <label className="text-gray-400 text-xs uppercase font-bold ml-1 mb-1 block">Описание</label>
                        <input
                            value={data.description_ru}
                            onChange={e => handleChange('description_ru', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-white font-semibold text-sm">Шаги сценария</label>
                        <span className="text-xs text-gray-500">{data.steps.length} шагов</span>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {data.steps.map((step, index) => (
                            <div key={index} className="bg-gray-900/80 p-3 rounded-xl border border-gray-700 relative group transition hover:border-gray-600">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-800 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 font-bold text-xs shrink-0 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            placeholder="Задание (что сделать)..."
                                            value={step.prompt_ru}
                                            onChange={e => handleStepChange(index, 'prompt_ru', e.target.value)}
                                            className="w-full bg-transparent border-b border-gray-700 px-0 py-1 text-white text-sm focus:border-blue-500 outline-none placeholder-gray-600"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                placeholder="Ответы (через запятую)..."
                                                value={(step.expected_fi || []).join(', ')}
                                                onChange={e => handleStepChange(index, 'expected_fi', e.target.value)}
                                                className="w-full bg-green-900/10 border border-green-900/30 rounded px-2 py-1 text-green-300 text-xs focus:border-green-500 outline-none placeholder-green-900/50"
                                            />
                                            <input
                                                placeholder="Подсказка..."
                                                value={step.hint_ru}
                                                onChange={e => handleStepChange(index, 'hint_ru', e.target.value)}
                                                className="w-full bg-yellow-900/10 border border-yellow-900/30 rounded px-2 py-1 text-yellow-300 text-xs focus:border-yellow-500 outline-none placeholder-yellow-900/50"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => removeStep(index)} className="opacity-50 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-900/20 rounded transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={addStep} className="w-full py-2 border border-dashed border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 hover:text-white transition bg-gray-900/30">
                        + Добавить шаг
                    </button>
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-gray-700/50">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 transition">Отмена</button>
                    <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition transform hover:scale-105">
                        Сохранить
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
