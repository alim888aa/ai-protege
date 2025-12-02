interface Concept {
  id: string;
  title: string;
  description: string;
}

interface ConceptCardProps {
  concept: Concept;
  index: number;
  canDelete: boolean;
  onTitleChange: (id: string, title: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onDelete: (id: string) => void;
}

export function ConceptCard({
  concept,
  index,
  canDelete,
  onTitleChange,
  onDescriptionChange,
  onDelete,
}: ConceptCardProps) {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 card-hover animate-fadeIn"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Concept {index + 1} - Title
          </label>
          <input
            type="text"
            value={concept.title}
            onChange={(e) => onTitleChange(concept.id, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter concept title"
          />
        </div>
        <button
          onClick={() => onDelete(concept.id)}
          disabled={!canDelete}
          className="ml-4 mt-7 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          title={!canDelete ? "Cannot delete the last concept" : "Delete concept"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={concept.description}
          onChange={(e) => onDescriptionChange(concept.id, e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
          placeholder="Describe this concept in 1-2 sentences"
        />
      </div>
    </div>
  );
}
