import { MorphingCardStack } from "@/components/ui/morphing-card-stack";
import { Layers, Palette, Clock, Command } from "lucide-react";

const cardData = [
  {
    id: "1",
    title: "Magnetic Dock",
    description: "Cursor-responsive scaling with smooth spring animations",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    id: "2",
    title: "Gradient Mesh",
    description: "Dynamic animated gradient backgrounds that follow your cursor",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    id: "3",
    title: "Pass Delivery",
    description: "Automated cryptographic digital pass issuance with live verification",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "4",
    title: "Command Palette",
    description: "Centralized rapid campus navigation with instant keyboard shortcuts",
    icon: <Command className="h-5 w-5" />,
  },
];

export default function MorphingCardStackDemo() {
  return <MorphingCardStack cards={cardData} />;
}
