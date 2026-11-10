/* An episode's YouTube description as readable show notes: blank lines separate
   paragraphs, "-" lines become a list (a line ending in ":" just above one is its
   heading), and web addresses and emails become links. */

const LINK = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;
const BULLET = /^[-•–]\s*/;

function Linked({ text }: { text: string }) {
  return text.split(LINK).map((part, i) => {
    if (i % 2 === 0) return part;
    // A full stop or bracket right after an address belongs to the sentence
    const [, href, trailing] = part.match(/^(.*?)([.,;:!?)]*)$/) ?? [part, part, ""];
    const isEmail = !href.startsWith("http");
    const label = isEmail ? href : href.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/$/, "");
    return (
      <span key={i}>
        <a
          href={isEmail ? `mailto:${href}` : href}
          {...(isEmail ? {} : { target: "_blank", rel: "nofollow noopener noreferrer" })}
          className="break-words font-semibold underline underline-offset-4"
        >
          {label}
        </a>
        {trailing}
      </span>
    );
  });
}

export default function ShowNotes({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((line) => line.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0);

  return (
    <div lang="es" className="flex flex-col gap-5 text-lg leading-relaxed text-plum/90">
      {blocks.map((lines, index) => {
        const heading = lines.length > 1 && !BULLET.test(lines[0]) ? lines[0] : undefined;
        const items = heading ? lines.slice(1) : lines;

        if (items.every((line) => BULLET.test(line))) {
          return (
            <div key={index}>
              {heading && <p className="mb-2 font-semibold">{heading}</p>}
              <ul className="flex list-disc flex-col gap-1.5 pl-6 marker:text-tangerine">
                {items.map((line, i) => (
                  <li key={i}>
                    <Linked text={line.replace(BULLET, "")} />
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return (
          <p key={index}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                <Linked text={line} />
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
