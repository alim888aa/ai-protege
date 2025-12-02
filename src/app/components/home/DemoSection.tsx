import Image from 'next/image';

export function DemoSection() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="relative animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        {/* Glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
        
        {/* Main image container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-700">
          <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-800 flex items-center px-4 gap-2 z-10">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Image
            src="/demo-2.png"
            alt="AI Protégé teaching interface - draw and explain concepts to an AI student"
            width={1200}
            height={675}
            className="w-full mt-8"
            priority
          />
        </div>

        {/* Floating annotation badges */}
        <div className="absolute -left-4 top-1/4 transform -translate-x-full hidden lg:flex items-center gap-2 animate-pulse">
          <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Draw your explanations ✏️
          </div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-transparent" />
        </div>

        <div className="absolute -right-4 top-1/4 transform translate-x-full hidden lg:flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <div className="w-8 h-0.5 bg-gradient-to-l from-purple-500 to-transparent" />
          <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            AI asks questions 🤔
          </div>
        </div>

        <div className="absolute -left-4 bottom-1/4 transform -translate-x-full hidden lg:flex items-center gap-2 animate-pulse" style={{ animationDelay: '1s' }}>
          <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Type explanations 💬
          </div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-transparent" />
        </div>

        <div className="absolute -right-4 bottom-1/4 transform translate-x-full hidden lg:flex items-center gap-2 animate-pulse" style={{ animationDelay: '1.5s' }}>
          <div className="w-8 h-0.5 bg-gradient-to-l from-orange-500 to-transparent" />
          <div className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Track progress 📊
          </div>
        </div>
      </div>
    </section>
  );
}
