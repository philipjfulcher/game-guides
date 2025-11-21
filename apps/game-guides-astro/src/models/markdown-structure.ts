export interface ActFrontMatter {
  title: string;
  subtitle?: string;
}

export interface Act extends ActFrontMatter {
  id: string;
  contentMarkdown: string;
  contentHtml: string;
  stepSummary: StepSummary[];
  completed: boolean;
}

export interface StepFrontmatter {
  order: string;
  title: string;
  optional?: string;
  automatic?: string;
  parent?: string;
}

export interface StepSummary {
  id: string;
  actId: string;
  order: number;
  title: string;
  optional: boolean;
  automatic: boolean;
  completed: boolean;
}

export interface Step {
  id: string;
  contentMarkdown: string;
  contentHtml: string;
  order: number;
  title: string;
  optional: boolean;
  automatic: boolean;
  parent?: string;
  substeps: Step[];
  completed: boolean;
  actId: string;
}
