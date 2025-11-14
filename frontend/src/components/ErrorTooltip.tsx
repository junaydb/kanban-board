import { Tooltip, TooltipTrigger, TooltipContent } from "@/shadcn/ui/tooltip";

export function ErrorTooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block w-full cursor-pointer">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        className="bg-red-500"
        arrowClassName="bg-red-500 fill-red-500"
      >
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}
