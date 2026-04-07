import { AuroraText } from "@/components/ui/aurora-text";

export function HeroHeading() {
  return (
    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-foreground text-center">
      Stellar-native tools
      <br />
      <AuroraText
        colors={["#a855f7", "#6366f1", "#38bdf8", "#818cf8", "#a855f7"]}
        speed={0.8}
      >
        for superagents.
      </AuroraText>
    </h1>
  );
}
