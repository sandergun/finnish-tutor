'use client';

export default function CycleSummaryBlock({ cycle, onNext }) {
  if (!cycle) {
    return (
      <div>
        <p>Загрузка итогов...</p>
        <button onClick={onNext} className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
          Продолжить
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-400 mb-6">Слова из этого цикла:</p>
      
      <div className="space-y-4">
        {cycle.words.map((word, index) => (
          <div key={index} className="p-4 rounded-lg bg-gray-800 flex items-center">
            <span className="text-3xl mr-4">{word.emoji}</span>
            <div>
              <p className="font-bold text-xl">{word.finnish}</p>
              <p className="text-gray-400">{word.russian}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onNext} className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl">
        Следующий цикл
      </button>
    </div>
  );
}
