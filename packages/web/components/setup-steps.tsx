import { Terminal, Wallet, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
      <h2 className="mb-8 text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Get started in 3 steps
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map(({ step, icon: Icon, title, description, detail, delay }) => (
          <BlurFade key={step} delay={delay} inView>
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="font-mono text-3xl font-bold text-border select-none">
                    {step}
                  </span>
                </div>
                <CardTitle className="mt-3 text-sm font-semibold">
                  {title}
                </CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {detail}
                </p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
