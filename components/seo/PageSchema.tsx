import React from "react";
import { BreadcrumbSchema, BreadcrumbItem } from "./JsonLd";

interface PageSchemaProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function PageSchema({ breadcrumbs }: PageSchemaProps) {
  return (
    <>
      {breadcrumbs && <BreadcrumbSchema items={breadcrumbs} />}
    </>
  );
}
export type { BreadcrumbItem };
