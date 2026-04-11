import { BookOpen } from "lucide-react";

const year = new Date().getFullYear();

// TODO: point to deployed docs URL once live (e.g. docs.pulsar.tools)
const DOCS_URL = "https://github.com/pulsarmcp/pulsar/tree/main/packages/docs";

const links = [
  {
    label: "Documentation",
    href: DOCS_URL,
    icon: <BookOpen className="size-3.5" />,
    external: true,
  },
  { label: "Tools", href: "/tools" },
  { label: "Skill", href: "/skill" },
  { label: "Explore", href: "/explore" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <p className="font-mono text-xs text-muted-foreground">
          PULSAR — Stellar-native MCP tools &copy; {year}
        </p>

        <div className="flex items-center gap-4">
          {links.map(({ label, href, icon, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {icon}
                {label}
              </a>
            ) : (
              <a
                key={label}
                href={href}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {icon}
                {label}
              </a>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}
