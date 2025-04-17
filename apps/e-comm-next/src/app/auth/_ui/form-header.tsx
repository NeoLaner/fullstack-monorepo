export function FormHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <span className="text-muted-foreground text-sm">{description}</span>
    </div>
  );
}
