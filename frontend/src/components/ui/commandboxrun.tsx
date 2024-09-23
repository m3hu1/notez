import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommandBoxRunProps {
  onRun: () => void;
}

const CommandBoxRun: React.FC<CommandBoxRunProps> = ({ onRun }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-[#18181A] p-2 border border-gray-600 rounded-lg shadow-lg flex items-center space-x-2 z-50">
      <div className="flex items-center bg-[#27272A] text-gray-400 px-2 py-1 rounded-md">
        <span className="text-xs">⌘</span>
        <span className="text-xs mx-1">+</span>
        <span className="text-xs">J</span>
      </div>
      <Button
        onClick={onRun}
        className="bg-[#27272A] text-gray-400 hover:bg-gray-600"
        variant="ghost"
        color="white"
        size="icon"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CommandBoxRun;