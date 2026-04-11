import { Terminal, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    icon: Terminal,
    title: "Install",
    description: "One command. Zero config.",
    detail:
      "Run the install command and XLMTools is immediately available as an MCP tool in Claude, Cursor, or any MCP-compatible host.",
  },
  {
    step: "02",
    icon: Wallet,
    title: "Fund",
    description: "Add testnet USDC to your Stellar wallet.",
    detail:
      "Get a Stellar testnet wallet and add USDC. The agent handles payment automatically per tool call — no manual steps.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Use",
    description: "Call any tool — payment is automatic.",
    detail:
      "Ask your agent to use any XLMTools tool. MPP handles the micropayment on Stellar instantly. Every call is on-chain.",
  },
];

export function SetupSteps() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3">
      {steps.map(({ step, icon: Icon, title, description, detail }, index) => (
        <div
          key={step}
          className={cn(
            "flex flex-col gap-5 py-8",
            // mobile: horizontal rule below all but last
            index < 2 && "border-b border-border sm:border-b-0",
            // desktop: vertical rule to the LEFT of step 2 and 3, padding between
            index > 0 && "sm:border-l sm:border-border sm:pl-10",
            index < 2 && "sm:pr-10",
          )}
        >
          {/* Number + icon row */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted-foreground/40 tracking-widest select-none">
              {step}
            </span>
            <div className="size-9 flex items-center justify-center rounded-xl bg-background text-foreground border border-border shadow-sm">
              <Icon className="size-4" />
            </div>
          </div>

          {/* Title + short description */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {title}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground leading-snug">
              {description}
            </p>
          </div>

          {/* Detail */}
          <p className="text-sm leading-relaxed text-muted-foreground/70">
            {detail}
          </p>
        </div>
      ))}
    </div>
  );
}
