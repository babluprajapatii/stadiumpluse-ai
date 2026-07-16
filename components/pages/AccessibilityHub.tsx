"use client";

import { useState } from "react";
import {
  Accessibility, HandMetal, Headphones, Heart, ParkingCircle,
  Ticket, MessageSquare, Navigation, Eye, Star, Activity, Volume2,
  Languages, MapPin, Settings, Phone, ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { Surface } from "../shared/Surface";
import { SectionHeading } from "../shared/SectionHeading";
import { MobileHeader } from "../shared/MobileHeader";
import { BottomNav } from "../shared/BottomNav";
import { StadiumMap } from "../stadium-map";
import { useApp } from "@/providers/AppContext";

export function AccessibilityHub() {
  const { setEmergency } = useApp();
  const [settings, setSettings] = useState({
    highContrast:  false,
    largeText:     true,
    reducedMotion: false,
    voiceNav:      false,
    screenReader:  true,
    signLanguage:  false,
  });
  const tog = (k: keyof typeof settings) => setSettings(x => ({ ...x, [k]: !x[k] }));

  const services = [
    { Icon: Accessibility,   label: "Wheelchair Access",  ok: true  },
    { Icon: HandMetal,        label: "ASL Interpreter",    ok: true  },
    { Icon: Headphones,       label: "Audio Description",  ok: true  },
    { Icon: Heart,            label: "Guide Dog Area",     ok: true  },
    { Icon: ParkingCircle,    label: "Accessible Parking", ok: false },
    { Icon: Ticket,           label: "Companion Ticket",   ok: true  },
    { Icon: MessageSquare,    label: "Quiet Room",         ok: true  },
    { Icon: Navigation,       label: "Accessible Route",   ok: true  },
  ];

  return (
    <div className="bg-background min-h-full flex flex-col">
      <MobileHeader
        title="Accessibility Hub"
        subtitle="FIFA World Cup 2026"
      />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-2xl mx-auto w-full">
        <div>
          <SectionHeading>Available Services</SectionHeading>
          <div className="grid grid-cols-2 gap-2.5">
            {services.map(({ Icon, label, ok }) => (
              <Surface key={label} className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", ok ? "bg-success-muted" : "bg-muted")}>
                  <Icon size={18} className={ok ? "text-success" : "text-muted-foreground"} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
                  <Badge variant={ok ? "success" : "error-soft"} className="mt-1.5">{ok ? "Available" : "Full"}</Badge>
                </div>
              </Surface>
            ))}
          </div>
        </div>

        <Surface className="border-primary/20 bg-primary/5">
          <p className="font-semibold text-sm text-foreground mb-1.5">Need assistance?</p>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Request a support volunteer, accessible seating swap, or mobility aid to your seat.
          </p>
          <Button className="w-full gap-2">
            <Accessibility size={15} aria-hidden="true" />Request Accommodation
          </Button>
        </Surface>

        <StadiumMap compact />

        <Surface>
          <p className="font-semibold text-sm text-foreground mb-4">Quick Controls</p>
          <div className="space-y-4">
            {([
              { key: "highContrast"  as const, label: "High Contrast",     Icon: Eye        },
              { key: "largeText"     as const, label: "Large Text",         Icon: Star       },
              { key: "reducedMotion" as const, label: "Reduced Motion",     Icon: Activity   },
              { key: "voiceNav"      as const, label: "Voice Navigation",   Icon: Volume2    },
              { key: "screenReader"  as const, label: "Screen Reader",      Icon: Headphones },
              { key: "signLanguage"  as const, label: "Sign Language Mode", Icon: Languages  },
            ]).map(({ key, label, Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-muted-foreground" aria-hidden="true" />
                  </div>
                  <Label htmlFor={key} className="text-sm text-foreground cursor-pointer">{label}</Label>
                </div>
                <Switch id={key} checked={settings[key]} onCheckedChange={() => tog(key)} aria-label={label} />
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="border-error/20 p-0 overflow-hidden">
          <button
            onClick={() => setEmergency(true)}
            className="flex items-center gap-3 w-full p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            aria-label="Emergency assist"
          >
            <div className="w-11 h-11 bg-error-muted rounded-full flex items-center justify-center shrink-0">
              <Phone size={18} className="text-error" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-error">Emergency Assist</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tap to reach venue accessibility team</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
          </button>
        </Surface>
      </div>
      <BottomNav items={[{ label: "Services", Icon: Accessibility }, { label: "Map", Icon: MapPin }, { label: "Settings", Icon: Settings }, { label: "Help", Icon: MessageSquare }]} />
    </div>
  );
}
