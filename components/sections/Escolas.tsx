"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, School } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicSite } from "@/lib/use-public-site";
import type { SchoolCategory, SchoolRecord } from "@/lib/app-types";
import { schoolCategories, schoolCategoryLabel, shiftsLabel } from "@/lib/app-utils";
import { cn } from "@/lib/utils";

const fallbackSchools: SchoolRecord[] = [
  {
    id: "fallback_lasalle",
    name: "Colegio La Salle Toledo",
    city: "Toledo, PR",
    category: "particular",
    address: "",
    neighborhood: "Jardim La Salle",
    shift: "Manha, Tarde",
    served: true,
    servedShifts: ["manha", "tarde"],
    active: true,
    createdAt: "",
  },
  {
    id: "fallback_porto",
    name: "Colegio Estadual Jardim Porto Alegre",
    city: "Toledo, PR",
    category: "estadual",
    address: "",
    neighborhood: "Jardim Porto Alegre",
    shift: "Manha, Tarde",
    served: true,
    servedShifts: ["manha", "tarde"],
    active: true,
    createdAt: "",
  },
  {
    id: "fallback_utfpr",
    name: "UTFPR Campus Toledo",
    city: "Toledo, PR",
    category: "faculdade",
    address: "",
    neighborhood: "Jardim La Salle",
    shift: "Noite",
    served: true,
    servedShifts: ["noite"],
    active: true,
    createdAt: "",
  },
];

export function Escolas() {
  const site = usePublicSite();
  const [filter, setFilter] = useState<SchoolCategory | "todas">("todas");
  const schools = site?.schools?.length ? site.schools : fallbackSchools;
  const servedSchools = schools.filter((schoolItem) => schoolItem.served && schoolItem.active);

  const visibleSchools = useMemo(() => {
    if (filter === "todas") return servedSchools;
    return servedSchools.filter((schoolItem) => schoolItem.category === filter);
  }, [filter, servedSchools]);

  return (
    <section id="escolas" className="bg-mist py-24 sm:py-32 dark:bg-[#0d1526]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Onde atendemos" title="Escolas atendidas em Toledo" />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["todas", ...schoolCategories].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category as SchoolCategory | "todas")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                filter === category
                  ? "bg-navy text-white dark:bg-sun dark:text-navy"
                  : "bg-white text-mute shadow-sm hover:text-navy dark:bg-white/5 dark:text-white/60 dark:hover:text-white"
              )}
            >
              {category === "todas" ? "Todas" : schoolCategoryLabel(category)}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSchools.map((schoolItem, index) => (
            <motion.div
              key={schoolItem.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
            >
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-sun">
                    <School size={18} />
                  </div>
                  <span className="rounded-full bg-sun/15 px-3 py-1 text-xs font-semibold text-sun-2">
                    {schoolCategoryLabel(schoolItem.category)}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-navy dark:text-white">{schoolItem.name}</h3>
                <p className="text-sm text-mute dark:text-white/60">{schoolItem.neighborhood || schoolItem.city}</p>
                <p className="mt-3 text-sm font-semibold text-navy dark:text-white">
                  Turnos: {shiftsLabel(schoolItem.servedShifts)}
                </p>
                <a
                  href="#contato"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-sun-2 dark:text-white"
                >
                  Consultar vaga <ArrowUpRight size={14} />
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
