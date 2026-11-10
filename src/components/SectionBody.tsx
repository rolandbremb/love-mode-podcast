/* Section text from the Studio: blank lines separate paragraphs, "- " lines form a list */
export default function SectionBody({ body }: { body: string }) {
  return body.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={index} className="flex list-disc flex-col gap-2 pl-6 marker:text-tangerine">
          {lines.map((line) => (
            <li key={line}>{line.slice(2)}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{lines.join(" ")}</p>;
  });
}
