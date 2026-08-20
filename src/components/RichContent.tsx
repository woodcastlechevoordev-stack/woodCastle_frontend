import { cn } from "@/lib/utils";

export function RichContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  if (!looksLikeHtml) {
    return (
      <div className={cn("prose-woodcastle", className)}>
        <p className="whitespace-pre-line">{html}</p>
      </div>
    );
  }

  return (
    <div
      className={cn("prose-woodcastle", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
