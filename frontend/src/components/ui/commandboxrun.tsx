import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandBoxRunProps {
  // onRun: () => void;
  onRun: () => Promise<void>; // spinner add karne ke liye, making this async
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CommandBoxRun: React.FC<CommandBoxRunProps> = ({
  onRun,
  isLoading,
  setIsLoading,
}) => {
  const handleRun = async () => {
    setIsLoading(true);
    try {
      await onRun();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-[#18181A] p-2 border border-gray-600 rounded-lg shadow-lg flex items-center space-x-2 z-50">
      <div className="flex items-center bg-[#27272A] text-gray-400 px-2 py-1 rounded-md">
        <span className="text-xs">⌘</span>
        <span className="text-xs mx-1">+</span>
        <span className="text-xs">J</span>
      </div>
      <Button
        onClick={handleRun}
        className={`${
          isLoading ? "bg-green-800" : "bg-green-700"
        } text-white hover:bg-green-600 transition-colors`}
        variant="ghost"
        size="icon"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default CommandBoxRun;
