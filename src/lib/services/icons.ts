import * as React from "react";
import {
  Activity,
  Ambulance,
  CalendarCheck,
  ClipboardList,
  Eye,
  FileHeart,
  FlaskConical,
  HeartPulse,
  Microscope,
  Pill,
  Radio,
  Scan,
  Scissors,
  ShieldAlert,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  Thermometer,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export function getServiceIcon(serviceName: string): LucideIcon {
  const name = serviceName.toLowerCase();

  if (name.includes("consult") || name.includes("general") || name.includes("doctor") || name.includes("physician") || name.includes("triage")) {
    return Stethoscope;
  }
  if (name.includes("lab") || name.includes("blood") || name.includes("pathology") || name.includes("specimen")) {
    return FlaskConical;
  }
  if (name.includes("pharm") || name.includes("drug") || name.includes("medication") || name.includes("dispens")) {
    return Pill;
  }
  if (name.includes("dent") || name.includes("oral") || name.includes("tooth") || name.includes("teeth")) {
    return Smile;
  }
  if (name.includes("regist") || name.includes("recept") || name.includes("admi") || name.includes("check-in") || name.includes("billing")) {
    return ClipboardList;
  }
  if (name.includes("emerg") || name.includes("urgent") || name.includes("trauma") || name.includes("casualty")) {
    return Ambulance;
  }
  if (name.includes("cardio") || name.includes("heart") || name.includes("ecg") || name.includes("echo")) {
    return HeartPulse;
  }
  if (name.includes("radio") || name.includes("x-ray") || name.includes("scan") || name.includes("mri") || name.includes("ct") || name.includes("imaging")) {
    return Scan;
  }
  if (name.includes("surg") || name.includes("operat") || name.includes("theatre")) {
    return Scissors;
  }
  if (name.includes("vaccin") || name.includes("immun") || name.includes("inject")) {
    return Syringe;
  }
  if (name.includes("pediat") || name.includes("child") || name.includes("baby") || name.includes("maternal")) {
    return Users;
  }
  if (name.includes("eye") || name.includes("ophthal") || name.includes("vision")) {
    return Eye;
  }
  if (name.includes("derma") || name.includes("skin")) {
    return Sparkles;
  }
  if (name.includes("nurse") || name.includes("ward") || name.includes("inpatient")) {
    return UserCheck;
  }

  return Activity;
}
