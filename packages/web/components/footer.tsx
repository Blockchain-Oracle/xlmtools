import { GitFork } from "lucide-react";

const year = new Date().getFullYear();

const links = [
  {
    label: "GitHub",
    href: "https://github.com/pulsarmcp/pulsar",
    icon: <GitFork className="size-3.5" />,
  },
  {
    label: "Stellar",
    href: "https://stellar.org",
  },
  {
    label: "X / Twitter",
    href: "https://x.com/pulsarmcp",
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <p className="font-mono text-xs text-muted-foreground">
          PULSAR — Stellar-native MCP tools &copy; {year}
        </p>

        <div className="flex items-center gap-4">
          {links.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {icon}
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
