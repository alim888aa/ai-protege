import { Target, PenLine, MessageSquare } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
        How It Works
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-xl mx-auto">
        Three simple steps to master any concept
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-zinc-700 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-6">
            <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Step 1</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Pick Your Topic</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose any concept you want to learn. Add a source URL, PDF, or start from scratch.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-zinc-700 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-6">
            <PenLine className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">Step 2</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Teach the AI</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Draw diagrams and write explanations. Teach the concept as if explaining to a curious student.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-zinc-700 hover:shadow-xl transition-shadow">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-6">
            <MessageSquare className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">Step 3</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Get Feedback</h3>
          <p className="text-gray-600 dark:text-gray-400">
            The AI asks clarifying questions and checks your understanding, helping you identify gaps.
          </p>
        </div>
      </div>
    </section>
  );
}
