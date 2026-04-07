import { Terminal, Wallet, Zap } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    icon: Terminal,
    title: "Install",
    description: "One command. Zero config.",
    detail:
      "Run the install command and PULSAR is immediately available as an MCP tool in Claude, Cursor, or any MCP-compatible host.",
    delay: 0.1,
    shineColor: ["#a1a1aa", "#52525b", "#a1a1aa"] as string[],
  },
  {
    step: "02",
    icon: Wallet,
    title: "Fund",
    description: "Add testnet USDC to your Stellar wallet.",
    detail:
      "Get a Stellar testnet wallet and add USDC. The agent handles payment automatically per tool call — no manual steps.",
    delay: 0.2,
    shineColor: ["#a1a1aa", "#71717a", "#a1a1aa"] as string[],
  },
  {
    step: "03",
    icon: Zap,
    title: "Use",
    description: "Call any tool — payment is automatic.",
    detail:
      "Ask your agent to use any PULSAR tool. MPP handles the micropayment on Stellar instantly. Every call is on-chain.",
    delay: 0.3,
    shineColor: ["#a1a1aa", "#52525b", "#a1a1aa"] as string[],
  },
];

export function SetupSteps() {
  return (
    <section className="w-full max-w-4xl">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {steps.map(({ step, icon: Icon, title, description, detail, delay, shineColor }) => (
          <BlurFade key={step} delay={delay} inView>
            <div
              className={cn(
                "relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6",
                "min-h-[240px]"
              )}
            >
              {/* Animated shine border overlay */}
              <ShineBorder
                shineColor={shineColor}
                duration={12}
                borderWidth={1}
              />

              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4.5" />
                </div>
                <span
                  className="font-mono text-4xl font-bold select-none"
                  style={{ color: "oklch(1 0 0 / 8%)" }}
                >
                  {step}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
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
