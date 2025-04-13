import { Check } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
  hasPending: boolean;
}

const NotificationBadge = ({ count, hasPending }: NotificationBadgeProps) => {
  return (
    <div className="absolute -top-3 right-3 z-10">
      {hasPending ? (
        <div className="bg-[#ffe599] text-black text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center shadow-md">
          {count}
        </div>
      ) : (
        <div className="bg-[#d9ead3] text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center shadow-md">
          <Check className="w-3 h-3" />
        </div>
      )}
    </div>
  );
};

export default NotificationBadge; 