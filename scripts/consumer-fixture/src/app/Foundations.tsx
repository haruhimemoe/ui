/**
 * @file scripts/consumer-fixture/src/app/Foundations.tsx
 * @desc The 0.12.0 pieces for the consumer check: Text in every tone and size, textClasses, a
 *       Button in a flex column, an essential-motion Button, download links, hidden-label fields,
 *       a Textarea (keeps its 6rem minimum height on a coarse pointer), ModBadge in all 17
 *       colors and the useMotionAllowed island. data-check hooks are what
 *       scripts/consumer-media.mjs measures.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import {
  Button,
  ButtonLink,
  Card,
  ModBadge,
  type ModBadgeColor,
  Select,
  Text,
  Textarea,
  TextInput,
  TextLink,
  textClasses,
} from "@haruhimemoe/ui";
import { MotionIsland } from "./MotionIsland";

const COLORS: readonly ModBadgeColor[] = [
  "sky",
  "amber",
  "rose",
  "violet",
  "emerald",
  "orange",
  "green",
  "teal",
  "pink",
  "lime",
  "cyan",
  "fuchsia",
  "yellow",
  "red",
  "indigo",
  "stone",
  "neutral",
];
const TONES = ["default", "muted", "subtle", "error", "warning", "success"] as const;
const SIZES = ["xs", "sm", "base"] as const;

export function Foundations() {
  return (
    <Card title="Foundations" headingLevel={3} data-check="card">
      {TONES.map((tone) =>
        SIZES.map((size) => (
          <Text key={`${tone}-${size}`} tone={tone} size={size}>
            {`${tone} ${size} text`}
          </Text>
        )),
      )}
      <Text as="span" tone="error" bold>
        Bold error span.
      </Text>
      <output className={textClasses({ tone: "success" })}>Saved.</output>
      <p className="text-c4" data-check="c4">
        Subtle c4 line.
      </p>
      <div className="flex w-80 flex-col gap-2" data-check="stack">
        <Button data-check="button">Stacked</Button>
      </div>
      <div data-motion="essential">
        <Button data-check="essential">Essential motion</Button>
      </div>
      <div className="flex flex-col gap-2" data-check="downloads">
        <ButtonLink href="/files/export.json" download variant="secondary">
          Download my data
        </ButtonLink>
        <TextLink href="/brand/palette.json" download="palette.json">
          Download palette (JSON)
        </TextLink>
      </div>
      <TextInput id="check-input" label="Hidden label input" hideLabel data-check="input" />
      <Select id="check-select" label="Hidden label select" hideLabel defaultValue="a">
        <option value="a">A</option>
      </Select>
      <Textarea id="check-textarea" label="Hidden label textarea" hideLabel data-check="textarea" />
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <ModBadge key={color} mod="NM1" color={color}>
            {color}
          </ModBadge>
        ))}
      </div>
      <MotionIsland />
    </Card>
  );
}
