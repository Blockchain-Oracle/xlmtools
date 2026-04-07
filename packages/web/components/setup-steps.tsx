import { Terminal, Wallet, Zap } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    icon: Terminal,
    title: "Install",
    description: "One command to install",
    detail:
      "Run the install command and PULSAR is immediately available as an MCP tool in your AI agent.",
    delay: 0.1,
  },
  {
    step: "02",
    icon: Wallet,
    title: "Fund",
    description: "Add testnet USDC to your Stellar wallet",
    detail:
      "Get a Stellar testnet wallet and fund it with USDC. The agent handles payment automatically per tool call.",
    delay: 0.2,
  },
  {
    step: "03",
    icon: Zap,
    title: "Use",
    description: "Call any tool — payment is automatic",
    detail:
      "Ask your agent to use any PULSAR tool. MPP handles the micropayment on Stellar instantly.",
    delay: 0.3,
  },
];

export function SetupSteps() {
  return (
    <section className="w-full max-w-4xl">
      <h2 className="mb-10 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        Get started in 3 steps
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {steps.map(({ step, icon: Icon, title, description, detail, delay }) => (
          <BlurFade key={step} delay={delay} inView>
            <div
              className={cn(
                "relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6",
                "min-h-[220px]"
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <span className="font-mono text-3xl font-bold text-border select-none">
                  {step}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground/70">
                {detail}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
